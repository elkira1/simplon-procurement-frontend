import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { requestsAPI } from "../../services/api";
import { Link, useSearchParams } from "react-router-dom";
import {
  FileText,
  Eye,
  Search,
  User,
  ChevronUp,
  ChevronDown,
  Filter,
} from "lucide-react";
import { toast } from "react-toastify";
import { getRequestStatusConfig } from "../../utils/requestStatus";

const RequestsList = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });
  const [filters, setFilters] = useState({
    status: searchParams.get("filter") || "",
    search: searchParams.get("q") || "",
    dateFrom: searchParams.get("from") || "",
    dateTo: searchParams.get("to") || "",
    urgency: searchParams.get("urgency") || "",
  });
  const [pagination, setPagination] = useState({
    page: Number(searchParams.get("page") || 1),
    pageSize: 20,
    count: 0,
  });

  // Utiliser useCallback pour éviter les re-rendus inutiles
  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  // Debounce pour la recherche
  const [searchTerm, setSearchTerm] = useState(filters.search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchTerm }));
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const orderingParam = React.useMemo(() => {
    if (sortConfig.key === "estimated_cost") {
      return sortConfig.direction === "asc"
        ? "estimated_cost"
        : "-estimated_cost";
    }
    return sortConfig.direction === "asc" ? "created_at" : "-created_at";
  }, [sortConfig]);

  const fetchRequests = useCallback(
    async (pageToLoad) => {
      try {
        setLoading(true);
        const response = await requestsAPI.getRequests({
          page: pageToLoad,
          pageSize: pagination.pageSize,
          status: filters.status,
          search: filters.search,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
          urgency: filters.urgency,
          ordering: orderingParam,
        });
        const payload = response.data;
        const results = payload.results || payload;
        setRequests(results);
        setPagination((prev) => ({
          ...prev,
          page: pageToLoad,
          count: payload.count ?? results.length,
        }));
      } catch (error) {
        toast.error("Erreur lors du chargement des demandes");
      } finally {
        setLoading(false);
      }
    },
    [
      filters.status,
      filters.search,
      filters.dateFrom,
      filters.dateTo,
      filters.urgency,
      orderingParam,
      pagination.pageSize,
    ]
  );

  useEffect(() => {
    fetchRequests(pagination.page);
  }, [fetchRequests, pagination.page]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.status) params.set("filter", filters.status);
    if (filters.search) params.set("q", filters.search);
    if (filters.dateFrom) params.set("from", filters.dateFrom);
    if (filters.dateTo) params.set("to", filters.dateTo);
    if (filters.urgency) params.set("urgency", filters.urgency);
    if (pagination.page > 1) {
      params.set("page", pagination.page.toString());
    }
    setSearchParams(params, { replace: true });
  }, [
    filters.status,
    filters.search,
    filters.dateFrom,
    filters.dateTo,
    filters.urgency,
    pagination.page,
    setSearchParams,
  ]);

  const resetFilters = () => {
    setFilters({
      status: "",
      search: "",
      dateFrom: "",
      dateTo: "",
      urgency: "",
    });
    setSearchTerm("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const goToPage = (pageNumber) => {
    setPagination((prev) => ({
      ...prev,
      page: Math.min(Math.max(1, pageNumber), totalPages || 1),
    }));
  };

  const canValidate = (request) => {
    if (user?.role === "mg" && request.status === "pending") return true;
    if (
      user?.role === "accounting" &&
      (request.status === "mg_approved" || request.status === "mg_validated")
    )
      return true;
    if (user?.role === "director" && request.status === "accounting_reviewed")
      return true;
    return false;
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const displayedRequests = requests;
  const totalPages = Math.max(
    1,
    Math.ceil((pagination.count || 0) / pagination.pageSize) || 1
  );
  const canGoPrev = pagination.page > 1;
  const canGoNext = pagination.page < totalPages;

  const SortableHeader = ({ column, children, className = "" }) => (
    <th
      className={`px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors ${className}`}
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center space-x-1">
        <span className="truncate">{children}</span>
        <div className="flex flex-col flex-shrink-0">
          <ChevronUp
            className={`h-3 w-3 ${
              sortConfig.key === column && sortConfig.direction === "asc"
                ? "text-blue-600"
                : "text-gray-400"
            }`}
          />
          <ChevronDown
            className={`h-3 w-3 -mt-1 ${
              sortConfig.key === column && sortConfig.direction === "desc"
                ? "text-blue-600"
                : "text-gray-400"
            }`}
          />
        </div>
      </div>
    </th>
  );

  // Composant pour l'affichage mobile en cartes
  const MobileRequestCard = ({ request }) => {
    const statusConfig = getRequestStatusConfig(request.status);
    const StatusIcon = statusConfig.icon;
    const needsValidation = canValidate(request);

    return (
      <div
        className={`bg-white border rounded-lg p-4 shadow-sm ${
          needsValidation ? "border-orange-200 bg-orange-50" : "border-gray-200"
        }`}
      >
        {needsValidation && (
          <div className="mb-3">
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800">
              Action requise
            </span>
          </div>
        )}

        <div className="space-y-3">
          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
              {request.item_description}
            </h3>
            {request.justification && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {request.justification}
              </p>
            )}
          </div>

          {/* Informations en grille */}
          <div className="grid grid-cols-2 gap-3">
            {/* Demandeur */}
            <div>
              <div className="text-xs text-gray-500 mb-1">Demandeur</div>
              <div className="flex items-center">
                <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                  <User className="h-3 w-3 text-gray-500" />
                </div>
                <span className="text-sm font-medium text-gray-900 truncate">
                  {request.user_name || "N/A"}
                </span>
              </div>
            </div>

            {/* Montant */}
            <div>
              <div className="text-xs text-gray-500 mb-1">Montant</div>
              <div className="text-sm font-semibold text-gray-900">
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "XOF",
                }).format(request.estimated_cost || 0)}
              </div>
            </div>

            {/* Date */}
            <div>
              <div className="text-xs text-gray-500 mb-1">Date</div>
              <div className="text-sm text-gray-900">
                {new Date(request.created_at).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </div>
            </div>

            {/* Statut */}
            <div>
              <div className="text-xs text-gray-500 mb-1">Statut</div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${statusConfig.dotClassName}`}
                ></div>
                <span
                  className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.className}`}
                >
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusConfig.label}
                </span>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="pt-2 border-t border-gray-100">
            <Link
              to={`/requests/${request.id}`}
              className="w-full inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-4 h-4 mr-2" />
              Voir les détails
            </Link>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            {user?.role === "employee"
              ? "Mes demandes"
              : "Gestion des demandes"}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {pagination.count} demande
            {pagination.count !== 1 ? "s" : ""} au total
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          {["employee", "mg"].includes(user?.role) && (
            <Link
              to="/requests/create"
              className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
            >
              <FileText className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Nouvelle demande</span>
              <span className="sm:hidden">Nouvelle</span>
            </Link>
          )}
        </div>
      </div>

      {/* Filtres et actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 space-y-4">
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
          {/* Recherche */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
          </div>

          {/* Filtre statut */}
          <div className="relative w-full sm:w-56">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="pl-10 pr-8 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">Tous les statuts</option>
              {(user?.role === "employee" || user?.role === "mg") && (
                <option value="pending">En attente</option>
              )}
              <option value="in_progress">En cours</option>
              <option value="director_approved">Approuvée</option>
              <option value="rejected">Refusée</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Du
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              className="w-full border border-gray-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Au
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              className="w-full border border-gray-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Urgence
            </label>
            <select
              value={filters.urgency}
              onChange={(e) => handleFilterChange("urgency", e.target.value)}
              className="w-full border border-gray-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white"
            >
              <option value="">Toutes</option>
              <option value="low">Faible</option>
              <option value="medium">Moyenne</option>
              <option value="high">Élevée</option>
              <option value="critical">Critique</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            {displayedRequests.length} élément
            {displayedRequests.length > 1 ? "s" : ""} sur {pagination.count}
          </p>
          <button
            onClick={resetFilters}
            className="text-xs font-medium text-gray-600 hover:text-red-600 transition-colors"
          >
            Réinitialiser les filtres
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      {displayedRequests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune demande trouvée
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto px-4">
              {user?.role === "employee"
                ? "Vous n'avez pas encore créé de demande. Cliquez sur 'Nouvelle demande' pour commencer."
                : "Aucune demande ne correspond à vos critères de recherche."}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Affichage desktop - tableau */}
          <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <SortableHeader column="item_description">
                      Description
                    </SortableHeader>
                    <SortableHeader column="user_name">
                      Demandeur
                    </SortableHeader>
                    <SortableHeader column="estimated_cost">
                      Montant
                    </SortableHeader>
                    <SortableHeader column="created_at">Date</SortableHeader>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayedRequests.map((request, index) => {
                    const statusConfig = getRequestStatusConfig(request.status);
                    const StatusIcon = statusConfig.icon;
                    const needsValidation = canValidate(request);

                    return (
                      <tr
                        key={request.id}
                        className={`hover:bg-blue-50 transition-colors ${
                          needsValidation ? "bg-gray-100" : ""
                        }`}
                      >
                        {/* Description */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-gray-900 max-w-xs line-clamp-2">
                              {request.item_description}
                            </div>
                            {request.justification && (
                              <div className="text-xs text-gray-500 mt-1 max-w-xs line-clamp-2">
                                {request.justification}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Demandeur */}
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-500" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {request.user_name || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Montant */}
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {new Intl.NumberFormat("fr-FR", {
                              style: "currency",
                              currency: "XOF",
                            }).format(
                              request.final_cost != null
                                ? request.final_cost
                                : request.estimated_cost || 0
                            )}
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {new Date(request.created_at).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(request.created_at).toLocaleTimeString(
                              "fr-FR",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </td>

                        {/* Statut */}
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                        <div
                          className={`w-2 h-2 rounded-full ${statusConfig.dotClassName}`}
                        ></div>
                        <span
                          className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.className}`}
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {needsValidation && (
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800">
                                Action requise
                              </span>
                            )}
                            <Link
                              to={`/requests/${request.id}`}
                              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Détails
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Affichage mobile/tablette - cartes */}
          <div className="lg:hidden space-y-4">
            {displayedRequests.map((request) => (
              <MobileRequestCard key={request.id} request={request} />
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl mt-4 p-4 flex flex-col md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-gray-500">
              Page {pagination.page} / {totalPages}
            </p>
            <div className="flex items-center space-x-2 mt-3 md:mt-0">
              <button
                onClick={() => goToPage(pagination.page - 1)}
                disabled={!canGoPrev}
                className="px-3 py-1.5 text-sm border rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <button
                onClick={() => goToPage(pagination.page + 1)}
                disabled={!canGoNext}
                className="px-3 py-1.5 text-sm border rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RequestsList;
