"use client"
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/FirebaseConfig';
import { FiUser, FiHash, FiPhone, FiSearch, FiX, FiCalendar, FiMapPin, FiActivity, FiPackage, FiDollarSign, FiFilter, FiTrendingUp, FiTruck, FiZap } from 'react-icons/fi';

interface Client {
  id: string;
  clientName: string;
  clientId: string;
  mobileNum: string;
  date: string;
  place: string;
  status: 'ACTIVE' | 'INACTIVE';
  stockType: 'DELIVERY' | 'SALES';
  margin: number;
}

export default function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [today] = useState(new Date().toISOString().split('T')[0]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    stockType: '',
    place: '',
    minMargin: '',
    maxMargin: ''
  });

  // Stats
  const activeClients = clients.filter(c => c.status === 'ACTIVE').length;
  const salesClients = clients.filter(c => c.stockType === 'SALES').length;
  const deliveryClients = clients.filter(c => c.stockType === 'DELIVERY').length;
  const totalClients = clients.length;

  useEffect(() => {
    const q = query(collection(db, 'clients-data'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const clientsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          clientName: doc.data().clientName || '',
          clientId: doc.data().clientId || '',
          mobileNum: doc.data().mobileNum || '',
          date: doc.data().date || '',
          place: doc.data().place || 'TIRUPATI',
          status: doc.data().status || 'ACTIVE',
          stockType: doc.data().stockType || 'DELIVERY',
          margin: doc.data().margin || 0
        }));
        setClients(clientsList);
        setFilteredClients(clientsList);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching clients:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let results = clients;
    
    // Apply search term filter
    if (searchTerm) {
      results = results.filter(client =>
        client.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.clientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.mobileNum.includes(searchTerm) ||
        client.date.includes(searchTerm) ||
        client.place.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply additional filters
    if (filters.status) {
      results = results.filter(client => client.status === filters.status);
    }
    if (filters.stockType) {
      results = results.filter(client => client.stockType === filters.stockType);
    }
    if (filters.place) {
      results = results.filter(client => client.place === filters.place);
    }
    if (filters.minMargin) {
      results = results.filter(client => client.margin >= Number(filters.minMargin));
    }
    if (filters.maxMargin) {
      results = results.filter(client => client.margin <= Number(filters.maxMargin));
    }

    setFilteredClients(results);
  }, [searchTerm, clients, filters]);

  const resetFilters = () => {
    setFilters({
      status: '',
      stockType: '',
      place: '',
      minMargin: '',
      maxMargin: ''
    });
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pb-20">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white shadow-sm">
          {/* Header with Gradient Background */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-xl">
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <FiUser className="text-white" />
                Client Directory
              </h2>
              <div className="flex flex-wrap items-center justify-between mt-2 gap-4">
                <p className="text-blue-100">
                  Showing {filteredClients.length} of {clients.length} clients
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center bg-blue-500/20 px-3 py-1 rounded-full text-white text-sm">
                    <FiActivity className="mr-1.5" />
                    Active: {activeClients}
                  </div>
                  <div className="flex items-center bg-green-500/20 px-3 py-1 rounded-full text-white text-sm">
                    <FiTrendingUp className="mr-1.5" />
                    Sales: {salesClients}
                  </div>
                  <div className="flex items-center bg-purple-500/20 px-3 py-1 rounded-full text-white text-sm">
                    <FiTruck className="mr-1.5" />
                    Delivery: {deliveryClients}
                  </div>
                  <div className="flex items-center bg-purple-500/20 px-3 py-1 rounded-full text-white text-sm">
                    <FiZap  className="mr-1.5" />
                    Total: {totalClients}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="p-4 bg-white border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search clients by name, ID, phone, date or place..."
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <FiX className="text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-400"
              >
                <FiFilter />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel - Now outside the sticky header */}
        {showFilters && (
          <div className="p-4 bg-white border-b border-gray-200 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-400"
                >
                  <option value="">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Type</label>
                <select
                  value={filters.stockType}
                  onChange={(e) => setFilters({...filters, stockType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-400"
                >
                  <option value="">All Types</option>
                  <option value="SALES">Sales</option>
                  <option value="DELIVERY">Delivery</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Place</label>
                <select
                  value={filters.place}
                  onChange={(e) => setFilters({...filters, place: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-400"
                >
                  <option value="">All Places</option>
                  <option value="TIRUPATI">Tirupati</option>
                  <option value="BANGALORE">Bangalore</option>
                  <option value="CHENNAI">Chennai</option>
                  <option value="HYDERABAD">Hyderabad</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Margin</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.minMargin}
                    onChange={(e) => setFilters({...filters, minMargin: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Margin</label>
                  <input
                    type="number"
                    placeholder="5000"
                    value={filters.maxMargin}
                    onChange={(e) => setFilters({...filters, maxMargin: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-400"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                Reset All
              </button>
            </div>
          </div>
        )}

        {/* Client Cards - Now always appears after filters when open */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredClients.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="mx-auto bg-white p-6 rounded-xl shadow-md max-w-md">
                <FiUser className="mx-auto text-gray-300 text-5xl mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-1">
                  {searchTerm || Object.values(filters).some(f => f) ? 'No matching clients found' : 'No clients available'}
                </h3>
                <p className="text-sm text-gray-400">
                  {searchTerm || Object.values(filters).some(f => f) ? 'Try adjusting your search or filters' : 'Check back later or add new clients'}
                </p>
                {(searchTerm || Object.values(filters).some(f => f)) && (
                  <button
                    onClick={resetFilters}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Clear Search & Filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            filteredClients.map((client) => (
              <div
                key={client.id}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group relative"
              >
                {/* Status badge */}
                <div className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full shadow-md ${
                  client.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {client.status}
                </div>
                
                {/* New badge for today's entries */}
                {client.date === today && (
                  <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md animate-pulse">
                    NEW
                  </div>
                )}
                
                <div className={`absolute inset-x-0 top-0 h-1 ${
                  client.stockType === 'SALES' ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-purple-400 to-indigo-500'
                }`}></div>
                
                <div className="p-6">
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 h-14 w-14 rounded-full flex items-center justify-center transition-colors ${
                      client.stockType === 'SALES' ? 
                        'bg-gradient-to-br from-green-100 to-emerald-100 group-hover:from-green-200 group-hover:to-emerald-200' :
                        'bg-gradient-to-br from-purple-100 to-indigo-100 group-hover:from-purple-200 group-hover:to-indigo-200'
                    }`}>
                      <FiUser className={`text-2xl transition-colors ${
                        client.stockType === 'SALES' ? 'text-green-600 group-hover:text-emerald-700' : 'text-purple-600 group-hover:text-indigo-700'
                      }`} />
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {client.clientName}
                      </h3>
                      <div className="flex items-center mt-1 text-sm text-gray-600">
                        <span>Client_ID: </span>    
                        <span className="truncate">{client.clientId}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Stock Type and Margin */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className={`px-2 py-1 rounded-md text-xs font-medium ${
                      client.stockType === 'SALES' ? 'bg-green-50 text-green-700' : 'bg-purple-50 text-purple-700'
                    }`}>
                      {client.stockType} STOCK
                    </div>
                    <div className="text-sm font-medium text-gray-700">
                      <span className="text-gray-500">Margin:</span> ₹ {client.margin}
                    </div>
                  </div>
                  
                  {/* Date and Place */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="flex items-center text-sm">
                      <FiCalendar className="flex-shrink-0 mr-2 text-gray-400" />
                      <span className="text-gray-700 truncate">
                        {client.date || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <FiMapPin className="flex-shrink-0 mr-2 text-gray-400" />
                      <span className="text-gray-700 truncate">
                        {client.place || 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Mobile Number */}
                  <div className="mt-4 flex items-center text-sm">
                    <FiPhone className="flex-shrink-0 mr-2 text-gray-400" />
                    <span className="font-medium text-gray-700">{client.mobileNum}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}