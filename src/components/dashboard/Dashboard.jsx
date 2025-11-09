import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { dashboardAPI } from "../../services/api";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowRight,
  Copy,
} from "lucide-react";
import { toast } from "react-toastify";

const StatCard = ({ icon: Icon, name, value, description, accent }) => (
  <div className="rounded-2xl border border-gray-100 bg-white/90 shadow-sm hover:shadow-md transition-shadow duration-200">
    <div className="p-5 flex items-center gap-4">
      <div
        className={`h-12 w-12 rounded-xl flex items-center justify-center text-white ${accent}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="truncate">
        <p className="text-sm text-gray-500">{name}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
    </div>
  </div>
);

const SectionCard = ({ title, description, children, action }) => (
  <div className="rounded-3xl border border-gray-100 bg-white shadow-sm">
    <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      {action}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const AlertItem = ({ alert, badge }) => {
  const handleCopy = () => {
    if (!alert.item_description) return;
    navigator.clipboard?.writeText(alert.item_description);
    toast.success("Description copiée dans le presse-papiers");
  };

  return (
    <div className="py-4 border-b last:border-b-0 space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium text-gray-900">{alert.item_description ? "Description" : "Demande"}</p>
          <p className="text-xs text-gray-500">
            {alert.user_name || "Utilisateur"} · {alert.urgency_display}
          </p>
          <p className="text-xs text-gray-400">
            En attente depuis {alert.daysWaiting} jour
            {alert.daysWaiting > 1 ? "s" : ""}
          </p>
        </div>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badge.class}`}
        >
          {badge.text}
        </span>
      </div>

      {alert.item_description && (
        <div className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2 text-sm text-gray-700 break-words">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Contenu de la demande</span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
            >
              <Copy className="h-3 w-3" />
              Copier
            </button>
          </div>
          <pre className="whitespace-pre-wrap break-words text-gray-800 text-sm font-medium">
            {alert.item_description}
          </pre>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
        <div className="text-gray-500">
          Dernière mise à jour :{" "}
          {new Date(alert.created_at).toLocaleDateString("fr-FR")}
        </div>
        <Link
          to={`/requests/${alert.id}`}
          className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
        >
          Voir la demande
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await dashboardAPI.getDashboard();
        setDashboardData(response.data);
      } catch (error) {
        toast.error("Erreur lors du chargement du dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const formatCurrency = (value = 0) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(value || 0);

  const statCards = useMemo(() => {
    if (!dashboardData) return [];
    const base = {
      employee: [
        {
          name: "Mes demandes",
          value: dashboardData?.total_requests || 0,
          icon: FileText,
          color: "bg-blue-500",
          description: "Total de mes demandes",
        },
        {
          name: "En attente",
          value: dashboardData?.pending_requests || 0,
          icon: Clock,
          color: "bg-yellow-500",
          description: "En attente de validation MG",
        },
        {
          name: "En cours",
          value: dashboardData?.in_progress_requests || 0,
          icon: RefreshCw,
          color: "bg-orange-500",
          description: "En cours de traitement",
        },
        {
          name: "Approuvées",
          value: dashboardData?.approved_requests || 0,
          icon: CheckCircle,
          color: "bg-green-500",
          description: "Demandes validées",
        },
        {
          name: "Refusées",
          value: dashboardData?.rejected_requests || 0,
          icon: XCircle,
          color: "bg-red-500",
          description: "Demandes rejetées",
        },
      ],
      mg: [
        {
          name: "Demandes reçues",
          value: dashboardData?.mes_demandes || 0,
          icon: FileText,
          color: "bg-sky-500",
          description: "Arrivées à mon niveau",
        },
        {
          name: "À traiter",
          value: dashboardData?.en_cours || 0,
          icon: RefreshCw,
          color: "bg-orange-500",
          description: "En attente d'action",
        },
        {
          name: "Validées",
          value: dashboardData?.acceptees || 0,
          icon: CheckCircle,
          color: "bg-emerald-500",
          description: "Validées par moi",
        },
        {
          name: "Refusées",
          value: dashboardData?.refusees || 0,
          icon: XCircle,
          color: "bg-rose-500",
          description: "Refusées par moi",
        },
      ],
    };
    return (
      base[user?.role] ||
      base.employee.slice(0, 4) ||
      [
        {
          name: "Demandes",
          value: dashboardData?.total_requests || 0,
          icon: FileText,
          color: "bg-blue-500",
          description: "Toutes les demandes",
        },
      ]
    );
  }, [dashboardData, user?.role]);

  const allRequests = dashboardData?.all_requests || [];
  const criticalAlerts = useMemo(
    () =>
      allRequests.filter(
        (req) =>
          req.urgency === "critical" && req.status !== "director_approved"
      ),
    [allRequests]
  );
  const overdueAlerts = useMemo(() => {
    const now = Date.now();
    return allRequests.filter((req) => {
      if (req.status === "director_approved") return false;
      const createdAt = new Date(req.created_at).getTime();
      const diffDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
      return diffDays >= 7;
    });
  }, [allRequests]);

  const highlightedAlerts = useMemo(() => {
    const now = Date.now();
    const map = new Map();
    [...criticalAlerts, ...overdueAlerts].forEach((req) => {
      if (map.has(req.id)) return;
      const createdAt = new Date(req.created_at).getTime();
      const diffDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
      map.set(req.id, { ...req, daysWaiting: diffDays });
    });
    return Array.from(map.values())
      .sort((a, b) => b.daysWaiting - a.daysWaiting)
      .slice(0, 4);
  }, [criticalAlerts, overdueAlerts]);

  const currentBudget =
    dashboardData?.current_period_stats?.total_amount || 0;
  const previousBudget =
    dashboardData?.previous_period_stats?.total_amount || 0;
  const budgetVariation = previousBudget
    ? ((currentBudget - previousBudget) / previousBudget) * 100
    : currentBudget > 0
    ? 100
    : 0;
  const budgetTrend = budgetVariation >= 0 ? "up" : "down";

  const quickActions = useMemo(() => {
    const actionsByRole = {
      employee: [
        {
          title: "Nouvelle demande",
          description: "Soumettre un besoin",
          to: "/requests/create",
          accent: "bg-blue-50 text-blue-600",
        },
        {
          title: "Mes demandes",
          description: "Suivi de l'avancement",
          to: "/requests",
          accent: "bg-green-50 text-green-600",
        },
      ],
      mg: [
        {
          title: "Validations",
          description: "Traiter les demandes reçues",
          to: "/validations",
          accent: "bg-orange-50 text-orange-600",
        },
        {
          title: "Toutes les demandes",
          description: "Vue d'ensemble",
          to: "/requests",
          accent: "bg-indigo-50 text-indigo-600",
        },
        {
          title: "Créer une demande",
          description: "Besoin urgent / personnel",
          to: "/requests/create",
          accent: "bg-blue-50 text-blue-600",
        },
      ],
    };
    return actionsByRole[user?.role] || actionsByRole.employee;
  }, [user?.role]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-gray-100 bg-gradient-to-r from-rose-50 to-white p-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between shadow-sm">
        <div>
          <p className="text-sm text-gray-500 uppercase">Tableau de bord</p>
          <h1 className="text-3xl font-semibold text-gray-900 mt-1">
            Bonjour {user?.first_name || user?.username},
          </h1>
          <p className="text-gray-500">
            {user?.role === "mg"
              ? "Pilotage des demandes arrivées à votre niveau."
              : "Suivi complet de votre activité d’achat."}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Dernière mise à jour</p>
          <p className="text-sm font-medium text-gray-700">
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <StatCard
            key={stat.name}
            icon={stat.icon}
            name={stat.name}
            value={stat.value}
            description={stat.description}
            accent={stat.color}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SectionCard
          title="Alertes critiques"
          description={`${criticalAlerts.length} urgences · ${overdueAlerts.length} en retard`}
          action={
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600">
              {criticalAlerts.length + overdueAlerts.length} en cours
            </span>
          }
        >
          {highlightedAlerts.length === 0 ? (
            <p className="text-sm text-gray-500">
              Aucune alerte active pour le moment. Vous êtes à jour !
            </p>
          ) : (
            highlightedAlerts.map((alert) => (
              <AlertItem
                key={alert.id}
                alert={alert}
                badge={{
                  className:
                    alert.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-600",
                  text: alert.status_display || alert.status,
                }}
              />
            ))
          )}
        </SectionCard>

        <SectionCard
          title="Budget approuvé"
          description="Montant global validé sur la période courante"
          action={
            <span
              className={`inline-flex items-center text-sm font-semibold ${
                budgetTrend === "up" ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {budgetTrend === "up" ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              {Math.abs(budgetVariation).toFixed(1)}%
            </span>
          }
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Budget validé</p>
              <p className="text-3xl font-semibold text-gray-900">
                {formatCurrency(currentBudget)}
              </p>
              <p className="text-xs text-gray-400">
                vs {formatCurrency(previousBudget)} la période précédente
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Demandes approuvées
                </p>
                <p className="text-xl font-semibold text-gray-900">
                  {dashboardData?.approved_requests || 0}
                </p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Montant moyen
                </p>
                <p className="text-xl font-semibold text-gray-900">
                  {formatCurrency(
                    currentBudget /
                      Math.max(1, dashboardData?.approved_requests || 1)
                  )}
                </p>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Actions rapides"
        description="Accès direct aux tâches fréquentes"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.to}
              className="rounded-2xl border border-gray-100 p-4 hover:border-gray-200 hover:shadow transition-all flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-gray-900">{action.title}</p>
                <p className="text-sm text-gray-500">{action.description}</p>
              </div>
              <div
                className={`h-9 w-9 rounded-full flex items-center justify-center ${action.accent}`}
              >
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </SectionCard>

      {user?.role === "employee" && dashboardData?.recent_requests && (
        <SectionCard
          title="Mes dernières demandes"
          description="Suivi en temps réel des statuts"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="pb-2">Description</th>
                  <th className="pb-2">Montant</th>
                  <th className="pb-2">Statut</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dashboardData.recent_requests.map((req) => (
                  <tr key={req.id} className="text-gray-700">
                    <td className="py-3">
                      <p className="font-medium">{req.item_description}</p>
                      <p className="text-xs text-gray-500">
                        Crée le{" "}
                        {new Date(req.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </td>
                    <td className="py-3 font-semibold">
                      {formatCurrency(req.estimated_cost || 0)}
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                        {req.status_display || req.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/requests/${req.id}`}
                        className="text-blue-600 text-xs font-medium hover:text-blue-800 inline-flex items-center gap-1"
                      >
                        Consulter
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </div>
  );
};

export default Dashboard;
