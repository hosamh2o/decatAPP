import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { exportAnalyticsToPDF, exportToCSV, formatDateRange } from "@/lib/exportUtils";
import { Loader2, Download, FileText } from "lucide-react";
import { useState } from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function AnalyticsWithExport() {
  const { user, loading } = useAuth();
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [isExporting, setIsExporting] = useState(false);

  // Use mock data for now - in production, this would come from tRPC
  const analytics = {
    totalOrders: 42,
    completedOrders: 35,
    pendingOrders: 7,
    totalRevenue: 125000,
    avgAssemblyTime: 45,
    recentOrders: [],
    recentInvoices: [],
    ordersTrend: [],
    revenueByDate: [],
  };
  const isLoading = false;

  if (loading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      if (analytics) {
        exportAnalyticsToPDF(
          {
            title: "Rapport Analytique - Assemblage de Vélos",
            dateRange: formatDateRange(new Date(startDate), new Date(endDate)),
            metrics: {
              "Commandes Totales": analytics.totalOrders,
              "Commandes Complétées": analytics.completedOrders,
              "Commandes en Attente": analytics.pendingOrders,
              "Revenus Totaux": `${(analytics.totalRevenue / 100).toFixed(2)}€`,
              "Temps Moyen d'Assemblage": `${analytics.avgAssemblyTime} min`,
            },
            orders: analytics.recentOrders || [],
            invoices: analytics.recentInvoices || [],
          },
          `rapport_analytique_${new Date().getTime()}`
        );
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      if (analytics) {
        const data = [
          {
            "Métrique": "Commandes Totales",
            "Valeur": analytics.totalOrders,
          },
          {
            "Métrique": "Commandes Complétées",
            "Valeur": analytics.completedOrders,
          },
          {
            "Métrique": "Commandes en Attente",
            "Valeur": analytics.pendingOrders,
          },
          {
            "Métrique": "Revenus Totaux",
            "Valeur": `${(analytics.totalRevenue / 100).toFixed(2)}€`,
          },
          {
            "Métrique": "Temps Moyen d'Assemblage",
            "Valeur": `${analytics.avgAssemblyTime} min`,
          },
        ];
        exportToCSV(data, `rapport_analytique_${new Date().getTime()}`);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const COLORS = ["#00D9FF", "#FF6B6B", "#4ECDC4", "#45B7D1"];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Export Buttons */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Analytique et Rapports</h1>
          <div className="flex gap-2">
            <Button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="gap-2 bg-red-500 hover:bg-red-600"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              Exporter PDF
            </Button>
            <Button
              onClick={handleExportCSV}
              disabled={isExporting}
              className="gap-2 bg-green-500 hover:bg-green-600"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Exporter CSV
            </Button>
          </div>
        </div>

        {/* Date Range Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtrer par Période</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de Début
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de Fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        {analytics && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Commandes Totales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-cyan-500">
                    {analytics.totalOrders}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Complétées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-500">
                    {analytics.completedOrders}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Revenus Totaux
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-500">
                    {(analytics.totalRevenue / 100).toFixed(2)}€
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Temps Moyen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-orange-500">
                    {analytics.avgAssemblyTime}m
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Orders Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Tendance des Commandes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={(analytics?.ordersTrend as any) || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#00D9FF"
                        name="Commandes"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribution des Statuts</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Complétées", value: analytics.completedOrders },
                          { name: "En Attente", value: analytics.pendingOrders },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[0, 1].map((index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Revenue Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Revenus par Période</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={(analytics?.revenueByDate as any) || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="revenue" fill="#00D9FF" name="Revenus (€)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
