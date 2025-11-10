import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Loader2, TrendingUp, Package, DollarSign, Clock } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Analytics() {
  const { user } = useAuth();
  const { data: analytics, isLoading } = trpc.analytics.managerDashboard.useQuery();
  const { data: ordersData } = trpc.analytics.ordersOverTime.useQuery();
  const { data: revenueData } = trpc.analytics.revenueOverTime.useQuery();
  const { data: statusData } = trpc.analytics.orderStatusDistribution.useQuery();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (!analytics) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center text-gray-600">
          Aucune donnée disponible
        </div>
      </DashboardLayout>
    );
  }

  // Prepare chart data
  const statusChartData = statusData
    ? [
        { name: "En attente", value: statusData.pending, fill: "#f59e0b" },
        { name: "En cours", value: statusData.in_progress, fill: "#3b82f6" },
        { name: "Complétées", value: statusData.completed, fill: "#10b981" },
      ]
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord Analytique</h1>
          <p className="text-gray-600 mt-2">Vue d'ensemble de vos performances</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Orders */}
          <Card className="border-cyan-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total des Commandes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{analytics.totalOrders}</p>
                  <p className="text-xs text-gray-500 mt-1">Depuis le début</p>
                </div>
                <Package className="w-8 h-8 text-cyan-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          {/* Completed Orders */}
          <Card className="border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Commandes Complétées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-green-600">{analytics.completedOrders}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {analytics.totalOrders > 0
                      ? Math.round((analytics.completedOrders / analytics.totalOrders) * 100)
                      : 0}
                    % du total
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          {/* Total Revenue */}
          <Card className="border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Revenu Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-blue-600">
                    {analytics.totalRevenue.toFixed(2)} €
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {analytics.paidInvoices} factures payées
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          {/* Average Assembly Time */}
          <Card className="border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Temps Moyen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-purple-600">{analytics.avgAssemblyTime}h</p>
                  <p className="text-xs text-gray-500 mt-1">Par assemblage</p>
                </div>
                <Clock className="w-8 h-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders Over Time */}
          <Card className="border-cyan-200">
            <CardHeader>
              <CardTitle>Commandes au Fil du Temps</CardTitle>
              <CardDescription>Tendance des commandes créées</CardDescription>
            </CardHeader>
            <CardContent>
              {ordersData && ordersData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={ordersData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="createdAt"
                      stroke="#6b7280"
                      style={{ fontSize: "12px" }}
                      tickFormatter={(date) => new Date(date).toLocaleDateString("fr-FR")}
                    />
                    <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="id"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      dot={{ fill: "#06b6d4", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-300 flex items-center justify-center text-gray-500">
                  Aucune donnée disponible
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Status Distribution */}
          <Card className="border-cyan-200">
            <CardHeader>
              <CardTitle>Distribution des Statuts</CardTitle>
              <CardDescription>État actuel de vos commandes</CardDescription>
            </CardHeader>
            <CardContent>
              {statusChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-300 flex items-center justify-center text-gray-500">
                  Aucune donnée disponible
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 gap-6">
          {/* Revenue Over Time */}
          <Card className="border-cyan-200">
            <CardHeader>
              <CardTitle>Revenu au Fil du Temps</CardTitle>
              <CardDescription>Tendance des revenus générés</CardDescription>
            </CardHeader>
            <CardContent>
              {revenueData && revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      stroke="#6b7280"
                      style={{ fontSize: "12px" }}
                      tickFormatter={(date) => new Date(date).toLocaleDateString("fr-FR")}
                    />
                    <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                      formatter={(value: any) => `${Number(value).toFixed(2)} €`}
                    />
                    <Bar dataKey="revenue" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-300 flex items-center justify-center text-gray-500">
                  Aucune donnée disponible
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders & Invoices */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card className="border-cyan-200">
            <CardHeader>
              <CardTitle>Commandes Récentes</CardTitle>
              <CardDescription>5 dernières commandes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.recentOrders && analytics.recentOrders.length > 0 ? (
                  analytics.recentOrders.map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{order.orderNumber}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : order.status === "in_progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status === "completed"
                          ? "Complétée"
                          : order.status === "in_progress"
                          ? "En cours"
                          : "En attente"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Aucune commande récente</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Invoices */}
          <Card className="border-cyan-200">
            <CardHeader>
              <CardTitle>Factures Récentes</CardTitle>
              <CardDescription>5 dernières factures</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.recentInvoices && analytics.recentInvoices.length > 0 ? (
                  analytics.recentInvoices.map((invoice: any) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                        <p className="text-xs text-gray-500">
                          {invoice.totalAmount.toFixed(2)} €
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          invoice.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : invoice.status === "sent"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {invoice.status === "paid"
                          ? "Payée"
                          : invoice.status === "sent"
                          ? "Envoyée"
                          : "Brouillon"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Aucune facture récente</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
