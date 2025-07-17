import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Filter, Download, RefreshCw } from 'lucide-react';

const AdminTable = ({
  title,
  description,
  data,
  columns,
  loading,
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  onRefresh,
  onExport,
  bulkActions,
  selectedItems,
  onSelectionChange,
  itemsPerPage = 10,
  currentPage,
  onPageChange,
  emptyStateIcon: EmptyStateIcon,
  emptyStateMessage,
  emptyStateDescription
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm || '');

  const handleSearch = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      onSelectionChange(data.map(item => item.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectItem = (itemId) => {
    if (selectedItems.includes(itemId)) {
      onSelectionChange(selectedItems.filter(id => id !== itemId));
    } else {
      onSelectionChange([...selectedItems, itemId]);
    }
  };

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
          {onExport && (
            <button
              onClick={onExport}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200"
            >
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar..."
              value={localSearchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          {filters && filters.map((filter, index) => (
            <select
              key={index}
              value={filter.value}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ))}
          <button
            onClick={onRefresh}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Filter className="h-4 w-4" />
            <span>Filtrar</span>
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && bulkActions && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {selectedItems.length} elemento(s) seleccionado(s)
            </span>
            <div className="flex gap-2">
              {bulkActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => action.onClick(selectedItems)}
                  className={`px-4 py-2 ${action.color || 'bg-blue-500 hover:bg-blue-600'} text-white rounded-lg transition-colors duration-200`}
                >
                  {action.label}
                </button>
              ))}
              <button
                onClick={() => onSelectionChange([])}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <tr>
                {onSelectionChange && (
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedItems.length === data.length && data.length > 0}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                )}
                {columns.map((column, index) => (
                  <th key={index} className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center">
                      {column.icon && <column.icon className="h-4 w-4 mr-2 text-blue-600" />}
                      {column.header}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {paginatedData.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-all duration-200">
                  {onSelectionChange && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  )}
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                      {column.render ? column.render(item) : item[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
          <div className="text-sm text-gray-700">
            Mostrando {startIndex + 1} a {Math.min(endIndex, data.length)} de {data.length} elementos
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 py-2 text-sm font-medium text-gray-700">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {data.length === 0 && !loading && (
        <div className="text-center py-12">
          {EmptyStateIcon && <EmptyStateIcon className="mx-auto h-12 w-12 text-gray-400" />}
          <h3 className="mt-2 text-sm font-medium text-gray-900">{emptyStateMessage}</h3>
          <p className="mt-1 text-sm text-gray-500">{emptyStateDescription}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default AdminTable; 