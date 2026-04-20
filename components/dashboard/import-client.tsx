/**
 * components/dashboard/import-client.tsx
 * Client component for handling the 3-step CSV import flow.
 * Steps: 1. Upload CSV, 2. Preview & Validate, 3. Results summary.
 */

"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Papa from "papaparse"
import { 
  Upload, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft, 
  Download,
  Loader2,
  PackageCheck
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

interface ImportRow {
  make: string
  model: string
  year: number
  color: string
  bodyType: string
  transmission: string
  fuelType: string
  mileage: number
  engineCapacity?: string
  price: number
  negotiable: boolean
  condition: string
  description?: string
  features: string[]
}

interface ImportResult {
  imported: number
  skipped: number
  errors: Array<{ row: number; message: string }>
}

export function ImportClient() {
  const router = useRouter()
  const [step, setStep] = React.useState<1 | 2 | 3>(1)
  const [file, setFile] = React.useState<File | null>(null)
  const [parsedRows, setParsedRows] = React.useState<ImportRow[]>([])
  const [isImporting, setIsImporting] = React.useState(false)
  const [importResult, setImportResult] = React.useState<ImportResult | null>(null)

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
        toast.error("Please upload a valid CSV file.")
        return
      }
      setFile(selectedFile)
      handleParse(selectedFile)
    }
  }

  const handleParse = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        const massagedData = results.data.map((row: any) => ({
          ...row,
          make: row.make != null ? String(row.make) : undefined,
          model: row.model != null ? String(row.model) : undefined,
          color: row.color != null ? String(row.color) : undefined,
          bodyType: row.bodyType != null ? String(row.bodyType) : undefined,
          transmission: row.transmission != null ? String(row.transmission) : undefined,
          fuelType: row.fuelType != null ? String(row.fuelType) : undefined,
          condition: row.condition != null ? String(row.condition) : undefined,
          engineCapacity: row.engineCapacity != null ? String(row.engineCapacity) : undefined,
          features: typeof row.features === "string" 
            ? row.features.split(",").map((f: string) => f.trim()).filter(Boolean)
            : Array.isArray(row.features) ? row.features : []
        }))
        
        setParsedRows(massagedData as ImportRow[])
        setStep(2)
      },
      error: (error) => {
        toast.error(`Error parsing CSV: ${error.message}`)
      }
    })
  }

  const handleImport = async () => {
    if (parsedRows.length === 0) return
    if (parsedRows.length > 50) {
      toast.error("Maximum 50 rows allowed per import.")
      return
    }

    setIsImporting(true)
    try {
      const response = await fetch("/api/dealer/import-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: parsedRows }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to import listings")
      }

      const result: ImportResult = await response.json()
      setImportResult(result)
      setStep(3)
      toast.success(`Import complete: ${result.imported} listings added.`)
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsImporting(false)
    }
  }

  const reset = () => {
    setFile(null)
    setParsedRows([])
    setImportResult(null)
    setStep(1)
  }

  // Basic client-side validation for Step 2 preview
  const isValidRow = (row: ImportRow) => {
    return (
      row.make && 
      row.model && 
      row.year && 
      typeof row.year === "number" &&
      row.price && 
      typeof row.price === "number"
    )
  }

  const validRowsCount = parsedRows.filter(isValidRow).length
  const invalidRowsCount = parsedRows.length - validRowsCount

  return (
    <div className="space-y-6">
      {/* Stepper Header (Optional but nice) */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
              step === s ? "border-primary bg-primary text-primary-foreground" : 
              step > s ? "border-primary bg-primary/20 text-primary" : "border-muted text-muted-foreground"
            }`}>
              {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
            </div>
            {s < 3 && <div className={`h-1 w-12 rounded ${step > s ? "bg-primary" : "bg-muted"}`} />}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <Card className="border-dashed border-2 bg-muted/30">
          <CardHeader className="text-center">
            <CardTitle>Upload your Inventory CSV</CardTitle>
            <CardDescription>
              Use our template to ensure your data is formatted correctly.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-10 space-y-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Upload className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center">
              <label htmlFor="csv-upload" className="cursor-pointer">
                <Button variant="outline" className="relative pointer-events-none">
                  Select CSV File
                </Button>
                <input 
                  id="csv-upload" 
                  type="file" 
                  accept=".csv" 
                  className="hidden" 
                  onChange={onFileChange}
                />
              </label>
              <p className="mt-2 text-sm text-muted-foreground">
                or drag and drop your file here
              </p>
            </div>
            <div className="pt-4 border-t w-full flex justify-center">
              <Button variant="ghost" size="sm" asChild>
                <a href="/aim-mombasa-inventory-template.csv" download className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download CSV Template
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Preview Listings {file && <span className="text-muted-foreground font-normal">({file.name})</span>}</CardTitle>
                <CardDescription>
                  Review your data before importing. Images will need to be added manually after import.
                </CardDescription>
              </div>
              <Badge variant={invalidRowsCount > 0 ? "destructive" : "success"}>
                {parsedRows.length} Rows Detected
              </Badge>
            </CardHeader>
            <CardContent>
              {invalidRowsCount > 0 && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>{invalidRowsCount} rows have missing or invalid required fields (Make, Model, Year, Price). These will be skipped.</span>
                </div>
              )}
              
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm text-yellow-700 dark:text-yellow-400">
                <AlertCircle className="h-4 w-4" />
                <span><strong>Note:</strong> Listings will be created without images. You'll need to upload photos to each car listing individually after import to improve ranking.</span>
              </div>

              <div className="rounded-md border overflow-hidden">
                <div className="relative w-full overflow-auto max-h-[400px]">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 sticky top-0 z-10">
                      <tr className="border-b">
                        <th className="h-10 px-4 text-left font-medium">#</th>
                        <th className="h-10 px-4 text-left font-medium">Make</th>
                        <th className="h-10 px-4 text-left font-medium">Model</th>
                        <th className="h-10 px-4 text-left font-medium">Year</th>
                        <th className="h-10 px-4 text-left font-medium">Price (KES)</th>
                        <th className="h-10 px-4 text-left font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedRows.map((row, index) => {
                        const valid = isValidRow(row)
                        return (
                          <tr key={index} className="border-b hover:bg-muted/30 transition-colors">
                            <td className="p-3 px-4 font-mono text-xs">{index + 1}</td>
                            <td className="p-3 px-4">{row.make || <span className="text-destructive">Missing</span>}</td>
                            <td className="p-3 px-4">{row.model || <span className="text-destructive">Missing</span>}</td>
                            <td className="p-3 px-4">{row.year || <span className="text-destructive">Missing</span>}</td>
                            <td className="p-3 px-4">{row.price ? formatCurrency(row.price) : <span className="text-destructive">Missing</span>}</td>
                            <td className="p-3 px-4">
                              {valid ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-5 w-5 text-destructive" />
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)} disabled={isImporting}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={isImporting || validRowsCount === 0 || parsedRows.length > 50}
              >
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    Import {validRowsCount} Listings
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {step === 3 && importResult && (
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <PackageCheck className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl mt-4">Import Complete!</CardTitle>
            <CardDescription>
              We've processed your CSV file and updated your inventory.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Imported</p>
                <p className="text-3xl font-bold text-green-600">{importResult.imported}</p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Skipped</p>
                <p className="text-3xl font-bold text-amber-600">{importResult.skipped}</p>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className="text-left">
                <p className="text-sm font-medium mb-2">Errors Summary:</p>
                <div className="max-h-[200px] overflow-auto rounded-md border bg-muted/30 p-2 text-xs space-y-1">
                  {importResult.errors.map((err, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="font-bold whitespace-nowrap text-destructive">Row {err.row}:</span>
                      <span className="text-muted-foreground">{err.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4 text-sm text-yellow-700 dark:text-yellow-400 text-left flex gap-3">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>
                <strong>Don't forget:</strong> Your new listings have no photos. Head to your inventory to upload images and a 360° walkaround (if available) to boost your completeness score and visibility.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="w-full" onClick={reset}>
              Import More
            </Button>
            <Button className="w-full" onClick={() => router.push("/dashboard/inventory")}>
              View Inventory
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
