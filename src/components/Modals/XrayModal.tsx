"use client"

import React, {useState, useEffect, useCallback} from 'react'
import ModalWrapper from './ModalWrapper'
import { Patient, Xray } from "@/lib/types"
import Image from 'next/image'
import { format, parseISO } from "date-fns"
import { tr } from 'date-fns/locale'
import { Calendar as CalendarIcon, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {Textarea} from "@/components/ui/textarea";
import {Input} from "@/components/ui/input";

interface XrayModalProps {
    isOpen: boolean
    onClose: () => void
    xray: Xray | null
    onDelete: (id: number) => void
    onUpdate: (id: number | null, data: Partial<Xray>) => void
    patients: Patient[]
    onLoaded?: () => void
}

const XrayModal: React.FC<XrayModalProps> = ({
                                                 isOpen,
                                                 onClose,
                                                 xray,
                                                 onDelete,
                                                 onUpdate,
                                                 patients,
                                                 onLoaded
                                             }) => {
    const [editedXray, setEditedXray] = useState<Partial<Xray>>({
        datePerformed: '',
        findings: '',
        impression: '',
        imageUrl: '',
        patient: { id: 0, firstName: '', lastName: '' }
    })
    const [file, setFile] = useState<File | null>(null)
    const [date, setDate] = useState<Date | undefined>(undefined)
    const [openPatientSelect, setOpenPatientSelect] = useState(false)
    const [selectedPatientId, setSelectedPatientId] = useState<string>("")
    const [imageError, setImageError] = useState(false)

    useEffect(() => {
        if (isOpen) {
            if (xray) {
                setEditedXray(xray)
                setDate(parseISO(xray.datePerformed))
                setSelectedPatientId(xray.patient.id.toString())
            } else {
                const now = new Date()
                setEditedXray({
                    datePerformed: now.toISOString().split('T')[0],
                    findings: '',
                    impression: '',
                    imageUrl: '',
                    patient: patients[0] || { id: 0, firstName: '', lastName: '' }
                })
                setDate(now)
                setSelectedPatientId(patients[0]?.id.toString() || "")
            }
            if (onLoaded) {
                onLoaded()
            }
        }
    }, [isOpen, xray, patients, onLoaded])

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setEditedXray(prev => ({ ...prev, [name]: value }))
    }, [])

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }, [])

    const uploadFile = useCallback(async () => {
        if (!file) return null

        const formData = new FormData()
        formData.append('file', file)

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error('File upload failed')
            }

            const data = await response.json()
            console.log('Uploaded file URL:', data.url)
            return data.url
        } catch (error) {
            console.error('Error uploading file:', error)
            return null
        }
    }, [file])

    const handleUpdate = useCallback(async () => {
        let imageUrl = editedXray.imageUrl
        if (file) {
            const uploadedUrl = await uploadFile()
            if (uploadedUrl) {
                imageUrl = uploadedUrl
            }
        }

        const utcDate = date ? new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())) : null
        const datePerformed = utcDate ? utcDate.toISOString() : ''

        const selectedPatient = patients.find(p => p.id.toString() === selectedPatientId)

        const updatedXray = {
            ...editedXray,
            imageUrl,
            datePerformed,
            patient: selectedPatient || editedXray.patient
        }
        console.log('Final X-ray data:', updatedXray)

        onUpdate(xray?.id || null, updatedXray)
        onClose()
    }, [editedXray, file, onUpdate, onClose, xray, uploadFile, date, selectedPatientId, patients])

    const handleDelete = useCallback(() => {
        if (xray && xray.id) {
            onDelete(xray.id)
            onClose()
        }
    }, [xray, onDelete, onClose])

    if (!isOpen) return null

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose}>
            <h2 className="text-2xl font-bold mb-4 text-foreground">{xray ? 'X-ray\'i Düzenle' : 'Yeni X-ray Ekle'}</h2>
            <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdate()
            }} className="space-y-4">
                <div>
                    <label htmlFor="patientId" className="block text-sm font-medium text-muted-foreground">Hasta:</label>
                    <Popover open={openPatientSelect} onOpenChange={setOpenPatientSelect}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openPatientSelect}
                                className="w-full justify-between"
                            >
                                {selectedPatientId
                                    ? patients.find((patient) => patient.id.toString() === selectedPatientId)?.firstName + ' ' + patients.find((patient) => patient.id.toString() === selectedPatientId)?.lastName
                                    : "Hasta seçin..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                            <Command>
                                <CommandInput placeholder="Hasta ara..."/>
                                <CommandList>
                                    <CommandEmpty>Hasta bulunamadı.</CommandEmpty>
                                    <CommandGroup>
                                        {patients.map((patient) => (
                                            <CommandItem
                                                key={patient.id}
                                                value={patient.id.toString()}
                                                onSelect={(currentValue) => {
                                                    setSelectedPatientId(currentValue === selectedPatientId ? "" : currentValue)
                                                    setOpenPatientSelect(false)
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedPatientId === patient.id.toString() ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {patient.firstName} {patient.lastName}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
                <div>
                    <label htmlFor="datePerformed" className="block text-sm font-medium text-muted-foreground">Tarih:</label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4"/>
                                {date ? format(date, "d MMMM yyyy", { locale: tr }) : <span>Tarih seçin</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" onClick={(e) => e.stopPropagation()}>
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                                locale={tr}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div>
                    <label htmlFor="findings" className="block text-sm font-medium text-muted-foreground">Bulgular:</label>
                    <Textarea
                        id="findings"
                        value={editedXray.findings || ''}
                        onChange={(e) => setEditedXray({...editedXray, findings: e.target.value})}
                        className="w-full bg-background border-input"
                    />
                </div>
                <div>
                    <label htmlFor="impression" className="block text-sm font-medium text-muted-foreground">İzlenim:</label>
                    <Textarea
                        id="impression"
                        value={editedXray.impression || ''}
                        onChange={(e) => setEditedXray({...editedXray, impression: e.target.value})}
                        className="w-full bg-background border-input"
                    />
                </div>
                <div>
                    <label htmlFor="image" className="block text-sm font-medium text-muted-foreground">Röntgen Görüntüsü:</label>
                    <Input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full bg-background border-input"
                    />
                </div>
                {(editedXray.imageUrl || file) && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">X-ray:</label>
                        <div className="relative w-full" style={{paddingBottom: '75%'}}>
                            <Image
                                src={
                                    imageError
                                        ? '/images/placeholder-xray.webp'
                                        : file
                                            ? URL.createObjectURL(file)
                                            : editedXray.imageUrl || '/images/placeholder-xray.webp'
                                }
                                alt="X-ray"
                                fill
                                className="object-contain"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                quality={90}
                                priority={false}
                                onError={() => setImageError(true)}
                                onLoad={() => {
                                    setImageError(false);
                                    if (file) {
                                        URL.revokeObjectURL(URL.createObjectURL(file));
                                    }
                                }}
                            />
                        </div>
                    </div>
                )}
                <div className="mt-6 flex justify-end space-x-3">
                    <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-600">
                        {xray ? 'Güncelle' : 'Ekle'}
                    </Button>
                    {xray && (
                        <Button type="button" onClick={handleDelete} className="bg-red-500 text-white hover:bg-red-600">
                            Sil
                        </Button>
                    )}
                    <Button type="button" onClick={onClose} variant="secondary">
                        İptal
                    </Button>
                </div>
            </form>
        </ModalWrapper>
    )
}

export default XrayModal