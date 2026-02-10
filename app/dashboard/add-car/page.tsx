import { AddCarForm } from "@/components/dashboard/add-car-form"

export default function AddCarPage() {
  return (
    <div className="space-y-8 p-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Add New Car</h1>
        <p className="text-muted-foreground">
          Create a new listing for your dealership. Fill in the details below.
        </p>
      </div>
      
      <AddCarForm />
    </div>
  )
}
