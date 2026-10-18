"use client";

import { useState, useMemo } from "react";
import {
  MapPin,
  Truck,
  Phone,
  Clock,
  CheckCircle2,
  Copy,
  Search,
  Filter,
  RefreshCw,
  ShoppingBag,
  Plus,
  Package,
  Check,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { Order, OrderStatus, NeighborhoodRouteGroup } from "@/types/order";
import type { Neighborhood } from "@/types/neighborhood";

interface OrdersManagerProps {
  initialOrders: Order[];
  neighborhoods: Neighborhood[];
}

export function OrdersManager({ initialOrders, neighborhoods }: OrdersManagerProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [activeTab, setActiveTab] = useState<"routes" | "list">("routes");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedNeighborhoodId, setCopiedNeighborhoodId] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Modal para criar pedido manual
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    customerName: "",
    customerWhatsapp: "",
    deliveryType: "delivery" as "delivery" | "pickup",
    neighborhoodId: "",
    address: "",
    addressNumber: "",
    complement: "",
    reference: "",
    paymentMethod: "pix" as "pix" | "money" | "debit" | "credit",
    needsChange: false,
    changeFor: "",
    itemsText: "",
    total: "",
    notes: "",
  });
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  // Recarregar pedidos da API
  const refreshOrders = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.error("Erro ao atualizar pedidos:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Atualizar status do pedido
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdatingOrderId(orderId);
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
      }
    } catch (e) {
      console.error("Erro ao atualizar status:", e);
      alert("Não foi possível atualizar o status do pedido.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Filtragem dos pedidos
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) return false;
      if (searchTerm.trim().length > 0) {
        const query = searchTerm.toLowerCase();
        const matchesName = order.customer_name.toLowerCase().includes(query);
        const matchesPhone = order.customer_whatsapp.includes(query);
        const matchesNeighborhood = order.neighborhood_name?.toLowerCase().includes(query) || false;
        const matchesAddress = order.address?.toLowerCase().includes(query) || false;
        const matchesNumber = String(order.order_number).includes(query);
        return matchesName || matchesPhone || matchesNeighborhood || matchesAddress || matchesNumber;
      }
      return true;
    });
  }, [orders, statusFilter, searchTerm]);

  // Agrupamento para visão de Rotas por Bairro
  const routeGroups = useMemo(() => {
    const deliveryOrders = filteredOrders.filter((o) => o.delivery_type === "delivery");
    const groupsMap = new Map<string, NeighborhoodRouteGroup>();

    deliveryOrders.forEach((order) => {
      const nId = order.neighborhood_id || "outros";
      const nName = order.neighborhood_name || "Bairro Não Informado";

      if (!groupsMap.has(nId)) {
        groupsMap.set(nId, {
          neighborhoodId: nId,
          neighborhoodName: nName,
          deliveryFee: order.delivery_fee,
          totalOrders: 0,
          totalRevenue: 0,
          orders: [],
        });
      }

      const group = groupsMap.get(nId)!;
      group.totalOrders += 1;
      group.totalRevenue += order.total;
      group.orders.push(order);
    });

    // Ordena bairros pela quantidade de pedidos decrescente ou nome
    return Array.from(groupsMap.values()).sort((a, b) => b.totalOrders - a.totalOrders || a.neighborhoodName.localeCompare(b.neighborhoodName));
  }, [filteredOrders]);

  // Copiar rota do bairro para enviar pro entregador
  const copyNeighborhoodRoute = (group: NeighborhoodRouteGroup) => {
    let text = `📍 ROTA DE ENTREGA - BAIRRO: ${group.neighborhoodName.toUpperCase()}\n`;
    text += `Total de Entregas: ${group.totalOrders} | Taxa: ${formatCurrency(group.deliveryFee)}\n`;
    text += `-------------------------------------------\n\n`;

    group.orders.forEach((order, index) => {
      text += `PARADA ${index + 1} (#${order.order_number}):\n`;
      text += `👤 Cliente: ${order.customer_name}\n`;
      text += `📞 WhatsApp: https://wa.me/55${order.customer_whatsapp.replace(/\D/g, "")}\n`;
      text += `🏠 Endereço: ${order.address || ""}, Nº ${order.address_number || "S/N"}\n`;
      if (order.complement) text += `🏢 Compl: ${order.complement}\n`;
      if (order.reference) text += `📌 Ponto de Ref: ${order.reference}\n`;

      const paymentText = {
        pix: "PIX",
        money: "Dinheiro",
        debit: "Cartão de Débito",
        credit: "Cartão de Crédito",
      }[order.payment_method];

      text += `💵 Pagamento: ${paymentText}`;
      if (order.payment_method === "money" && order.payment_details?.needsChange) {
        text += ` (Levar troco para ${formatCurrency(Number(order.payment_details.changeFor || 0))})`;
      }
      text += ` | Total: ${formatCurrency(order.total)}\n`;
      text += `-------------------------------------------\n\n`;
    });

    navigator.clipboard.writeText(text);
    setCopiedNeighborhoodId(group.neighborhoodId);
    setTimeout(() => setCopiedNeighborhoodId(null), 2500);
  };

  // Criar pedido manual
  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmittingManual(true);
      const selectedN = neighborhoods.find((n) => n.id === manualForm.neighborhoodId);
      const fee = manualForm.deliveryType === "delivery" ? Number(selectedN?.delivery_fee || 0) : 0;
      const totalNum = Number(manualForm.total.replace(",", ".")) || 0;
      const subtotal = Math.max(0, totalNum - fee);

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: manualForm.customerName,
          customerWhatsapp: manualForm.customerWhatsapp,
          deliveryType: manualForm.deliveryType,
          neighborhoodId: manualForm.neighborhoodId || null,
          neighborhoodName: selectedN?.name || null,
          address: manualForm.address || null,
          addressNumber: manualForm.addressNumber || null,
          complement: manualForm.complement || null,
          reference: manualForm.reference || null,
          deliveryFee: fee,
          subtotal,
          total: totalNum,
          paymentMethod: manualForm.paymentMethod,
          paymentDetails: {
            needsChange: manualForm.needsChange,
            changeFor: manualForm.needsChange ? Number(manualForm.changeFor) : undefined,
          },
          items: [
            {
              productId: "manual",
              name: manualForm.itemsText || "Itens do Pedido",
              price: totalNum,
              quantity: 1,
            },
          ],
          notes: manualForm.notes,
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setOrders((prev) => [data.order, ...prev]);
        setIsManualModalOpen(false);
        setManualForm({
          customerName: "",
          customerWhatsapp: "",
          deliveryType: "delivery",
          neighborhoodId: "",
          address: "",
          addressNumber: "",
          complement: "",
          reference: "",
          paymentMethod: "pix",
          needsChange: false,
          changeFor: "",
          itemsText: "",
          total: "",
          notes: "",
        });
      } else {
        alert(data.error || "Erro ao registrar pedido.");
      }
    } catch {
      alert("Erro ao comunicar com o servidor.");
    } finally {
      setIsSubmittingManual(false);
    }
  };

  // Status badges
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
            <Clock className="h-3 w-3" /> Pendente
          </span>
        );
      case "preparing":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-[11px] font-bold text-indigo-800">
            <Package className="h-3 w-3" /> Em Preparação
          </span>
        );
      case "dispatched":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-800">
            <Truck className="h-3 w-3" /> Em Rota
          </span>
        );
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
            <CheckCircle2 className="h-3 w-3" /> Entregue
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
            Cancelado
          </span>
        );
    }
  };

  // Contadores rápidos
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const dispatchedCount = orders.filter((o) => o.status === "dispatched").length;
  const deliveryCount = orders.filter((o) => o.delivery_type === "delivery" && o.status !== "delivered" && o.status !== "cancelled").length;

  return (
    <div className="space-y-6">
      {/* Topo: Título & Ações Rápidas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-900 uppercase">
              Logística & Entregas
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {orders.length} pedidos no total
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Gestão de Pedidos & Rotas
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Organize os pedidos por bairros para facilitar as entregas do motoboy e despachar com agilidade.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshOrders}
            disabled={isRefreshing}
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold h-10 px-3 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Atualizar
          </Button>

          <Button
            size="sm"
            onClick={() => setIsManualModalOpen(true)}
            className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold h-10 px-4 shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-1" /> Novo Pedido Manual
          </Button>
        </div>
      </div>

      {/* Cards de Métricas de Entrega */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Pendentes
          </span>
          <p className="text-2xl font-black text-amber-950">{pendingCount}</p>
          <p className="text-[11px] text-amber-700">Aguardando separação</p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5" /> Em Rota de Entrega
          </span>
          <p className="text-2xl font-black text-blue-950">{dispatchedCount}</p>
          <p className="text-[11px] text-blue-700">Com o motoboy</p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> Bairros com Entrega
          </span>
          <p className="text-2xl font-black text-emerald-950">{routeGroups.length}</p>
          <p className="text-[11px] text-emerald-700">{deliveryCount} entregas pendentes</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <ShoppingBag className="h-3.5 w-3.5 text-slate-600" /> Total em Vendas
          </span>
          <p className="text-2xl font-black text-slate-900">
            {formatCurrency(orders.reduce((acc, o) => acc + (o.status !== "cancelled" ? o.total : 0), 0))}
          </p>
          <p className="text-[11px] text-slate-500">Histórico de pedidos</p>
        </div>
      </div>

      {/* Barra de Filtros e Seleção de Modo */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Alternador de Abas */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("routes")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "routes"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MapPin className="h-3.5 w-3.5 text-amber-600" />
            Rotas por Bairro ({routeGroups.length})
          </button>

          <button
            onClick={() => setActiveTab("list")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "list"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5 text-slate-600" />
            Todos os Pedidos ({filteredOrders.length})
          </button>
        </div>

        {/* Busca e Filtro de Status */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar cliente, rua ou nº..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-1">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
              className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-amber-500"
            >
              <option value="all">Todos os Status</option>
              <option value="pending">Pendentes</option>
              <option value="preparing">Em Preparação</option>
              <option value="dispatched">Em Rota</option>
              <option value="delivered">Entregues</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>
        </div>
      </div>

      {/* CONTEÚDO DA ABA 1: ROTAS POR BAIRRO */}
      {activeTab === "routes" && (
        <div className="space-y-4">
          {routeGroups.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Nenhuma entrega no momento</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Assim que seus clientes finalizarem pedidos de entrega pelo site, eles serão agrupados automaticamente por bairro aqui para você montar as rotas do motoboy.
              </p>
            </div>
          ) : (
            routeGroups.map((group) => {
              const isCopied = copiedNeighborhoodId === group.neighborhoodId;

              return (
                <div
                  key={group.neighborhoodId}
                  className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden transition-all hover:border-slate-300"
                >
                  {/* Cabeçalho do Bairro */}
                  <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-zinc-900 px-5 py-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-400 font-bold shrink-0">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                            {group.neighborhoodName}
                          </h2>
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                            Taxa: {formatCurrency(group.deliveryFee)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">
                          <strong>{group.totalOrders}</strong> {group.totalOrders === 1 ? "pedido" : "pedidos"} neste bairro • Total:{" "}
                          <strong className="text-emerald-400">{formatCurrency(group.totalRevenue)}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => copyNeighborhoodRoute(group)}
                        className={`rounded-xl text-xs font-bold transition-all gap-1.5 h-9 px-3.5 cursor-pointer ${
                          isCopied
                            ? "bg-emerald-500 text-white"
                            : "bg-white text-slate-900 hover:bg-slate-100"
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-3.5 w-3.5" /> Rota Copiada!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" /> Copiar Rota p/ Motoboy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Lista de Pedidos daquele Bairro */}
                  <div className="p-4 sm:p-5 divide-y divide-slate-100 space-y-4">
                    {group.orders.map((order, index) => {
                      const isUpdating = updatingOrderId === order.id;
                      const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${order.address || ""}, ${order.address_number || ""}, ${order.neighborhood_name || ""}`
                      )}`;
                      const cleanPhone = order.customer_whatsapp.replace(/\D/g, "");

                      return (
                        <div key={order.id} className={index > 0 ? "pt-4" : ""}>
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            {/* Dados do Cliente e Endereço */}
                            <div className="space-y-2 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono font-bold text-slate-800">
                                  #{order.order_number}
                                </span>
                                {getStatusBadge(order.status)}
                                <span className="text-xs font-bold text-slate-900">
                                  {order.customer_name}
                                </span>
                                <a
                                  href={`https://wa.me/55${cleanPhone}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md transition"
                                >
                                  <Phone className="h-3 w-3" /> {order.customer_whatsapp}
                                </a>
                              </div>

                              {/* Endereço Completo */}
                              <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 space-y-1.5 text-xs">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="font-semibold text-slate-800">
                                      {order.address || "Endereço não informado"}, Nº {order.address_number || "S/N"}
                                      {order.complement ? ` • ${order.complement}` : ""}
                                    </p>
                                  </div>
                                  <a
                                    href={gmapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded-md shrink-0"
                                  >
                                    <Navigation className="h-3 w-3" /> Ver no Maps
                                  </a>
                                </div>

                                {/* Destaque Ponto de Referência (Essencial para o Motoboy) */}
                                {order.reference && (
                                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-2 text-[11px] font-medium text-amber-900 flex items-start gap-1.5">
                                    <strong className="shrink-0 text-amber-950 font-bold">Ponto de Referência:</strong>
                                    <span>{order.reference}</span>
                                  </div>
                                )}
                              </div>

                              {/* Forma de Pagamento e Itens */}
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                                <div>
                                  Forma de Pagamento:{" "}
                                  <strong className="text-slate-800 uppercase font-bold">
                                    {order.payment_method === "pix"
                                      ? "PIX"
                                      : order.payment_method === "money"
                                      ? "Dinheiro"
                                      : order.payment_method === "debit"
                                      ? "Débito"
                                      : "Crédito"}
                                  </strong>
                                  {order.payment_method === "money" && order.payment_details?.needsChange && (
                                    <span className="ml-1 text-rose-600 font-bold">
                                      (Levar troco para {formatCurrency(Number(order.payment_details.changeFor || 0))})
                                    </span>
                                  )}
                                </div>
                                <div>
                                  Total: <strong className="text-emerald-700 font-extrabold">{formatCurrency(order.total)}</strong>
                                </div>
                              </div>

                              {/* Lista de Itens */}
                              <div className="text-[11px] text-slate-500">
                                <strong>Itens: </strong>
                                {order.items.map((item, i) => (
                                  <span key={i}>
                                    {item.quantity}x {item.name}
                                    {item.size ? ` (${item.size})` : ""}
                                    {item.color ? ` - Cor: ${item.color}` : ""}
                                    {i < order.items.length - 1 ? " • " : ""}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Ações Rápidas de Status da Rota */}
                            <div className="flex flex-row lg:flex-col items-center justify-end gap-1.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                              {order.status === "pending" && (
                                <Button
                                  size="sm"
                                  disabled={isUpdating}
                                  onClick={() => handleUpdateStatus(order.id, "dispatched")}
                                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold h-8 px-3 cursor-pointer shadow-xs gap-1"
                                >
                                  <Truck className="h-3.5 w-3.5" /> Despachar p/ Rota
                                </Button>
                              )}

                              {order.status === "dispatched" && (
                                <Button
                                  size="sm"
                                  disabled={isUpdating}
                                  onClick={() => handleUpdateStatus(order.id, "delivered")}
                                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-8 px-3 cursor-pointer shadow-xs gap-1"
                                >
                                  <Check className="h-3.5 w-3.5" /> Marcar Entregue
                                </Button>
                              )}

                              {order.status === "delivered" && (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 py-1">
                                  <CheckCircle2 className="h-4 w-4" /> Entregue com Sucesso
                                </span>
                              )}

                              {order.status !== "cancelled" && order.status !== "delivered" && (
                                <button
                                  disabled={isUpdating}
                                  onClick={() => {
                                    if (confirm("Deseja realmente cancelar este pedido?")) {
                                      handleUpdateStatus(order.id, "cancelled");
                                    }
                                  }}
                                  className="text-[11px] text-slate-400 hover:text-rose-600 transition cursor-pointer p-1"
                                >
                                  Cancelar Pedido
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* CONTEÚDO DA ABA 2: TODOS OS PEDIDOS (CRONOLÓGICO) */}
      {activeTab === "list" && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              Nenhum pedido encontrado para os filtros selecionados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3"># Pedido</th>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Tipo & Bairro</th>
                    <th className="px-4 py-3">Itens</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Pagamento</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((order) => {
                    const isUpdating = updatingOrderId === order.id;

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">
                          #{order.order_number}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-900">{order.customer_name}</p>
                          <a
                            href={`https://wa.me/55${order.customer_whatsapp.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <Phone className="h-3 w-3" /> {order.customer_whatsapp}
                          </a>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                              order.delivery_type === "delivery"
                                ? "bg-amber-100 text-amber-900"
                                : "bg-purple-100 text-purple-900"
                            }`}
                          >
                            {order.delivery_type === "delivery" ? "Entrega" : "Retirada"}
                          </span>
                          <p className="font-medium text-slate-700 mt-1">
                            {order.neighborhood_name || "Balcão"}
                          </p>
                        </td>
                        <td className="px-4 py-3 max-w-xs truncate text-slate-600">
                          {order.items.map((it) => `${it.quantity}x ${it.name}`).join(", ")}
                        </td>
                        <td className="px-4 py-3 font-bold text-emerald-700">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold uppercase text-slate-700">
                            {order.payment_method}
                          </span>
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(order.status)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {order.status === "pending" && (
                              <Button
                                size="sm"
                                disabled={isUpdating}
                                onClick={() => handleUpdateStatus(order.id, "dispatched")}
                                className="h-7 text-[10px] rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                              >
                                Rota
                              </Button>
                            )}
                            {order.status === "dispatched" && (
                              <Button
                                size="sm"
                                disabled={isUpdating}
                                onClick={() => handleUpdateStatus(order.id, "delivered")}
                                className="h-7 text-[10px] rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                              >
                                Entregue
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL: CRIAR PEDIDO MANUAL */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Novo Pedido Manual</h3>
                <p className="text-xs text-slate-500">
                  Cadastre um pedido recebido por WhatsApp ou balcão para incluir na rota.
                </p>
              </div>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateManualOrder} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nome do Cliente *</label>
                  <input
                    type="text"
                    required
                    value={manualForm.customerName}
                    onChange={(e) => setManualForm({ ...manualForm, customerName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-amber-500 focus:outline-hidden"
                    placeholder="Ex: Maria da Silva"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={manualForm.customerWhatsapp}
                    onChange={(e) => setManualForm({ ...manualForm, customerWhatsapp: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-amber-500 focus:outline-hidden"
                    placeholder="86988000000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipo de Entrega</label>
                  <select
                    value={manualForm.deliveryType}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, deliveryType: e.target.value as "delivery" | "pickup" })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-amber-500 focus:outline-hidden"
                  >
                    <option value="delivery">Entrega (Motoboy)</option>
                    <option value="pickup">Retirada na Loja</option>
                  </select>
                </div>

                {manualForm.deliveryType === "delivery" && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Bairro *</label>
                    <select
                      required
                      value={manualForm.neighborhoodId}
                      onChange={(e) => setManualForm({ ...manualForm, neighborhoodId: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-amber-500 focus:outline-hidden"
                    >
                      <option value="">Selecione o Bairro</option>
                      {neighborhoods.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.name} (Taxa: {formatCurrency(n.delivery_fee)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {manualForm.deliveryType === "delivery" && (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="font-bold text-slate-700 block mb-1">Endereço / Rua</label>
                      <input
                        type="text"
                        value={manualForm.address}
                        onChange={(e) => setManualForm({ ...manualForm, address: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-amber-500 focus:outline-hidden"
                        placeholder="Rua Exemplo"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Número</label>
                      <input
                        type="text"
                        value={manualForm.addressNumber}
                        onChange={(e) => setManualForm({ ...manualForm, addressNumber: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-amber-500 focus:outline-hidden"
                        placeholder="123"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Ponto de Referência (Importante para a Rota)
                    </label>
                    <input
                      type="text"
                      value={manualForm.reference}
                      onChange={(e) => setManualForm({ ...manualForm, reference: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-amber-500 focus:outline-hidden"
                      placeholder="Próximo à padaria, casa com portão cinza..."
                    />
                  </div>
                </>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Itens do Pedido</label>
                <input
                  type="text"
                  value={manualForm.itemsText}
                  onChange={(e) => setManualForm({ ...manualForm, itemsText: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-amber-500 focus:outline-hidden"
                  placeholder="Ex: 1x Vestido Floral M, 1x Bolsa Preta"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Forma de Pagamento</label>
                  <select
                    value={manualForm.paymentMethod}
                    onChange={(e) =>
                      setManualForm({
                        ...manualForm,
                        paymentMethod: e.target.value as "pix" | "money" | "debit" | "credit",
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-amber-500 focus:outline-hidden"
                  >
                    <option value="pix">PIX</option>
                    <option value="money">Dinheiro</option>
                    <option value="credit">Cartão de Crédito</option>
                    <option value="debit">Cartão de Débito</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Valor Total (R$) *</label>
                  <input
                    type="text"
                    required
                    value={manualForm.total}
                    onChange={(e) => setManualForm({ ...manualForm, total: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-amber-500 focus:outline-hidden font-bold"
                    placeholder="Ex: 89.90"
                  />
                </div>
              </div>

              {manualForm.paymentMethod === "money" && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <input
                    type="checkbox"
                    id="needsChangeManual"
                    checked={manualForm.needsChange}
                    onChange={(e) => setManualForm({ ...manualForm, needsChange: e.target.checked })}
                    className="rounded text-amber-600"
                  />
                  <label htmlFor="needsChangeManual" className="font-bold text-slate-800">
                    Precisa de Troco?
                  </label>
                  {manualForm.needsChange && (
                    <input
                      type="text"
                      placeholder="Troco para quanto?"
                      value={manualForm.changeFor}
                      onChange={(e) => setManualForm({ ...manualForm, changeFor: e.target.value })}
                      className="w-36 rounded-lg border border-amber-300 px-2 py-1 bg-white text-xs"
                    />
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsManualModalOpen(false)}
                  className="rounded-xl text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingManual}
                  className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold"
                >
                  {isSubmittingManual ? "Salvando..." : "Cadastrar Pedido"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
