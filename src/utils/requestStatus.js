import {
  Clock,
  RefreshCw,
  CheckCircle,
  XCircle,
} from "lucide-react";

export const REQUEST_STATUS_CONFIG = {
  pending: {
    icon: Clock,
    className: "bg-amber-100 text-amber-800",
    label: "En attente",
    dotClassName: "bg-amber-400",
  },
  mg_approved: {
    icon: RefreshCw,
    className: "bg-blue-100 text-blue-800",
    label: "Validée MG",
    dotClassName: "bg-blue-400",
  },
  mg_validated: {
    icon: RefreshCw,
    className: "bg-blue-100 text-blue-800",
    label: "Validée MG",
    dotClassName: "bg-blue-400",
  },
  accounting_reviewed: {
    icon: RefreshCw,
    className: "bg-purple-100 text-purple-800 text-center",
    label: "Revue Comptabilité",
    dotClassName: "bg-purple-400",
  },
  director_approved: {
    icon: CheckCircle,
    className: "bg-emerald-100 text-emerald-800",
    label: "Approuvée",
    dotClassName: "bg-emerald-400",
  },
  rejected: {
    icon: XCircle,
    className: "bg-red-100 text-red-800",
    label: "Refusée",
    dotClassName: "bg-red-400",
  },
};

const DEFAULT_STATUS_CONFIG = {
  icon: Clock,
  className: "bg-gray-100 text-gray-800",
  label: "Statut inconnu",
  dotClassName: "bg-gray-400",
};

export const getRequestStatusConfig = (status) =>
  REQUEST_STATUS_CONFIG[status] ?? {
    ...DEFAULT_STATUS_CONFIG,
    label: status || DEFAULT_STATUS_CONFIG.label,
  };
