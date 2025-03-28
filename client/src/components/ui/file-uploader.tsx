"use client"

import * as React from "react"
import { File, FileText, X } from "lucide-react" // Use File icon for PDF
import Dropzone, {
  type DropzoneProps,
  type FileRejection,
} from "react-dropzone"
import { toast } from "sonner"

import { cn, formatBytes } from "@/lib/utils"
import { useControllableState } from "@/hooks/use-controllable-state"
import { Button } from "@/components/ui/button"

interface FileUploaderProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: File[]
  onValueChange?: (files: File[]) => void
  onUpload?: (files: File[]) => Promise<void>
  progresses?: Record<string, number>
  maxSize?: DropzoneProps["maxSize"]
  maxFileCount?: DropzoneProps["maxFiles"]
  multiple?: boolean
  disabled?: boolean
}

export function FileUploader(props: FileUploaderProps) {
  const {
    value: valueProp,
    onValueChange,
    onUpload,
    progresses,
    maxSize = 1024 * 1024 * 2, // 2MB
    maxFileCount = 1,
    multiple = false,
    disabled = false,
    className,
    ...dropzoneProps
  } = props

  const [files, setFiles] = useControllableState({
    prop: valueProp,
    onChange: onValueChange,
  })

  const onDrop = React.useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (!multiple && maxFileCount === 1 && acceptedFiles.length > 1) {
        toast.error("Cannot upload more than 1 file at a time")
        return
      }

      if ((files?.length ?? 0) + acceptedFiles.length > maxFileCount) {
        toast.error(`Cannot upload more than ${maxFileCount} files`)
        return
      }

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      )

      const updatedFiles = files ? [...files, ...newFiles] : newFiles

      setFiles(updatedFiles)

      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file }) => {
          toast.error(`File ${file.name} was rejected`)
        })
      }

      if (
        onUpload &&
        updatedFiles.length > 0 &&
        updatedFiles.length <= maxFileCount
      ) {
        const target =
          updatedFiles.length > 1 ? `${updatedFiles.length} files` : `file`

        toast.promise(onUpload(updatedFiles), {
          loading: `Uploading ${target}...`,
          success: () => {
            setFiles([])
            return `${target} uploaded`
          },
          error: `Failed to upload ${target}`,
        })
      }
    },
    [files, maxFileCount, multiple, onUpload, setFiles]
  )

  function onRemove(index: number) {
    if (!files) return
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    onValueChange?.(newFiles)
  }

  const isDisabled = disabled || (files?.length ?? 0) >= maxFileCount


  return (
    <div className="relative flex flex-col gap-6 overflow-hidden">
      { files?.length ? <Button onClick={() => onRemove(0)} className="top-4 right-0 z-20 absolute bg-red-500 hover:bg-red-600 mt-[5vh] mr-[10vw] cursor-pointer" size='icon'><X /></Button> : ''}
      <Dropzone
        onDrop={onDrop}
        accept={{ "application/pdf": [] }} // Only accept PDF files
        maxFiles={maxFileCount}
        multiple={maxFileCount > 1 || multiple}
        disabled={isDisabled}
      >
        {({ getRootProps, getInputProps, isDragActive }) => (
          <div
            {...getRootProps()}
            className={cn(
              "group relative grid h-[304px] w-full cursor-pointer place-items-center rounded-[16px] border-2 border-dashed border-muted-foreground/25 px-5 py-2.5 text-center transition hover:bg-muted/25",
              "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-[#F9F9FB]",
              isDragActive && "border-muted-foreground/50",
              isDisabled && "pointer-events-none opacity-60",
              className
            )}
            {...dropzoneProps}
          >
            <input type='file' {...getInputProps()} />
            {
              files?.length && files instanceof Array
              ?
              files?.map((file, index) => (
                <FileCard
                  key={index}
                  file={file}
                  onRemove={() => onRemove(index)}
                  progress={progresses?.[file.name]}
                />
              ))
              :
              isDragActive ? (
                <div className="flex flex-col justify-center items-center gap-4 sm:px-5">
                  <File
                    strokeWidth={1}
                    className="opacity-50 size-[64px] text-muted-foreground"
                    aria-hidden="true"
                  />
                  <p className="font-medium text-muted-foreground">
                    Drop the PDF file here
                  </p>
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center gap-4 sm:px-5">
                  <File
                    strokeWidth={1}
                    className="opacity-50 size-[64px] text-muted-foreground"
                    aria-hidden="true"
                  />
                  <div className="flex flex-col gap-px">
                    <p className="font-mont font-semibold text-[#696E75]">
                      Drag & Drop or <span className="text-royalpurple">Select PDF</span>
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Max file size: {formatBytes(maxSize)}
                    </p>
                  </div>
                </div>
              )
            }
          </div>
        )}
      </Dropzone>
    </div>
  )
}

interface FileCardProps {
  file: File
  onRemove: () => void
  progress?: number
}

function FileCard({ file }: FileCardProps) {
  return (
    <div className="relative place-content-center grid h-full">
      <div className="flex flex-col items-center gap-2.5">
        <FileText size={64} />
        <div className="font-semibold text-xl">
          {file.name}
        </div>
        <div>
          File size: {formatBytes(file.size)}
        </div>
      </div>
    </div>
  )
}