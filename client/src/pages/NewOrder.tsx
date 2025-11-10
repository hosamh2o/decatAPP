import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2, Camera, X, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { BarcodeScanner } from "@/components/BarcodeScanner";

interface OrderBike {
  bikeTypeId: number;
  quantity: number;
  scannedBarcodes: string[];
}

export default function NewOrder() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [bikes, setBikes] = useState<OrderBike[]>([]);
  const [notes, setNotes] = useState("");
  const [selectedBikeType, setSelectedBikeType] = useState<number | "">("");
  const [quantity, setQuantity] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [currentScanningBikeIndex, setCurrentScanningBikeIndex] = useState<number | null>(null);
  const [manualBarcode, setManualBarcode] = useState("");

  const { data: bikeTypes = [] } = trpc.bikeTypes.list.useQuery();
  const createMutation = trpc.orders.create.useMutation();

  useEffect(() => {
    if (!loading && (!user || user.role !== "manager")) {
      setLocation("/");
    }
  }, [user, loading, setLocation]);

  const handleAddBike = () => {
    if (!selectedBikeType || !quantity) {
      toast.error("Veuillez sélectionner un type et une quantité");
      return;
    }

    const newBike: OrderBike = {
      bikeTypeId: Number(selectedBikeType),
      quantity: Number(quantity),
      scannedBarcodes: [],
    };

    setBikes([...bikes, newBike]);
    setSelectedBikeType("");
    setQuantity("");
    toast.success("Type de vélo ajouté");
  };

  const handleRemoveBike = (index: number) => {
    setBikes(bikes.filter((_, i) => i !== index));
  };

  const handleStartScanning = (index: number) => {
    setCurrentScanningBikeIndex(index);
    setShowScanner(true);
  };

  const handleBarcodeScan = (barcode: string) => {
    if (currentScanningBikeIndex === null) return;

    const updatedBikes = [...bikes];
    const currentBike = updatedBikes[currentScanningBikeIndex];

    if (currentBike.scannedBarcodes.includes(barcode)) {
      toast.error("Duplicate barcode");
      return;
    }

    if (currentBike.scannedBarcodes.length >= currentBike.quantity) {
      toast.error("All bikes scanned");
      return;
    }

    currentBike.scannedBarcodes.push(barcode);
    setBikes(updatedBikes);
    toast.success(`Scanned (${currentBike.scannedBarcodes.length}/${currentBike.quantity})`);

    if (currentBike.scannedBarcodes.length === currentBike.quantity) {
      setShowScanner(false);
      setCurrentScanningBikeIndex(null);
    }
  };

  const handleManualBarcode = () => {
    if (!manualBarcode.trim()) {
      toast.error("Enter barcode");
      return;
    }
    handleBarcodeScan(manualBarcode);
    setManualBarcode("");
  };

  const handleRemoveBarcode = (bikeIndex: number, barcodeIndex: number) => {
    const updatedBikes = [...bikes];
    updatedBikes[bikeIndex].scannedBarcodes.splice(barcodeIndex, 1);
    setBikes(updatedBikes);
  };

  const handleSubmit = async () => {
    if (bikes.length === 0) {
      toast.error("Add bikes");
      return;
    }

    const incompleteBikes = bikes.filter(
      (bike) => bike.scannedBarcodes.length < bike.quantity
    );

    if (incompleteBikes.length > 0) {
      toast.error("Scan all barcodes");
      return;
    }

    try {
      const result = await createMutation.mutateAsync({
        bikes: bikes.map((bike) => ({
          bikeTypeId: bike.bikeTypeId,
          quantity: bike.quantity,
        })),
        notes,
      });
      toast.success(`Order: ${result.orderNumber}`);
      setLocation("/manager/orders");
    } catch (error) {
      toast.error("Error creating order");
    }
  };

  if (loading || !user) return null;

  const getTotalBikes = () => bikes.reduce((sum, bike) => sum + bike.quantity, 0);
  const getTotalScanned = () =>
    bikes.reduce((sum, bike) => sum + bike.scannedBarcodes.length, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Order</h1>
          <p className="text-gray-600 mt-2">Select bikes and scan barcodes</p>
        </div>

        {getTotalBikes() > 0 && (
          <Card className="border-cyan-200 bg-cyan-50/50">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">Scan Progress</span>
                  <span className="text-cyan-600 font-semibold">
                    {getTotalScanned()}/{getTotalBikes()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-cyan-500 h-2 rounded-full transition-all"
                    style={{ width: `${(getTotalScanned() / getTotalBikes()) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-cyan-200">
          <CardHeader>
            <CardTitle>Add Bikes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <select value={selectedBikeType} onChange={(e) => setSelectedBikeType(e.target.value ? Number(e.target.value) : "")} className="border rounded-lg p-2">
                <option value="">Select type</option>
                {bikeTypes.map((type: any) => (
                  <option key={type.id} value={type.id}>{type.nameFr} - {(type.price / 100).toFixed(2)}€</option>
                ))}
              </select>
              <Input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="1" />
              <Button onClick={handleAddBike} className="bg-cyan-500 hover:bg-cyan-600">
                <Plus className="w-4 h-4 mr-2" /> Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {bikes.length > 0 && (
          <Card className="border-cyan-200">
            <CardHeader>
              <CardTitle>Selected Bikes ({bikes.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {bikes.map((bike, index) => {
                const bikeType = bikeTypes.find((t: any) => t.id === bike.bikeTypeId);
                const isComplete = bike.scannedBarcodes.length === bike.quantity;

                return (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{bikeType?.nameFr}</p>
                        <p className="text-sm text-gray-600">
                          {bike.quantity} × {(bikeType?.price ?? 0 / 100).toFixed(2)}€
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {isComplete && (
                          <div className="flex items-center gap-1 text-green-600 font-semibold">
                            <Check className="w-4 h-4" /> Done
                          </div>
                        )}
                        <Button variant="destructive" size="sm" onClick={() => handleRemoveBike(index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Barcodes</span>
                        <span className="font-semibold text-cyan-600">
                          {bike.scannedBarcodes.length}/{bike.quantity}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            isComplete ? "bg-green-500" : "bg-cyan-500"
                          }`}
                          style={{ width: `${(bike.scannedBarcodes.length / bike.quantity) * 100}%` }}
                        />
                      </div>
                    </div>

                    {bike.scannedBarcodes.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-700">Scanned:</p>
                        <div className="flex flex-wrap gap-2">
                          {bike.scannedBarcodes.map((barcode, barcodeIndex) => (
                            <div
                              key={barcodeIndex}
                              className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-1"
                            >
                              <code className="text-xs font-mono text-green-700">{barcode}</code>
                              <button
                                onClick={() => handleRemoveBarcode(index, barcodeIndex)}
                                className="text-green-600 hover:text-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!isComplete && (
                      <Button
                        onClick={() => handleStartScanning(index)}
                        variant="outline"
                        className="w-full border-cyan-300 text-cyan-600 hover:bg-cyan-50"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Scan ({bike.scannedBarcodes.length}/{bike.quantity})
                      </Button>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        <Card className="border-cyan-200">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Input placeholder="Add notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button onClick={() => setLocation("/manager/dashboard")} variant="outline" className="flex-1">Cancel</Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending || bikes.length === 0} className="flex-1 bg-cyan-500 hover:bg-cyan-600">
            {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            Submit
          </Button>
        </div>

        {showScanner && currentScanningBikeIndex !== null && (
          <BarcodeScanner
            onScan={handleBarcodeScan}
            onClose={() => {
              setShowScanner(false);
              setCurrentScanningBikeIndex(null);
            }}
          />
        )}

        {showScanner && currentScanningBikeIndex !== null && (
          <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center">
            <Card className="w-full max-w-sm mx-4 border-cyan-200">
              <CardHeader>
                <CardTitle className="text-lg">Manual Barcode</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Enter barcode manually:
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Barcode..."
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handleManualBarcode();
                    }}
                    autoFocus
                  />
                  <Button
                    onClick={handleManualBarcode}
                    className="bg-cyan-500 hover:bg-cyan-600"
                  >
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
