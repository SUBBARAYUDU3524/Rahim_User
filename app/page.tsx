"use client"
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/FirebaseConfig';
import { FiUser, FiHash, FiPhone, FiSearch, FiX, FiCalendar, FiMapPin } from 'react-icons/fi';

interface Client {
  id: string;
  clientName: string;
  clientId: string;
  mobileNum: string;
  date: string;
  place: string;
}

export default function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [today] = useState(new Date().toISOString().split('T')[0]); // Today's date in YYYY-MM-DD format

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
          place: doc.data().place || 'TIRUPATI'
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
    const results = clients.filter(client =>
      client.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.clientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.mobileNum.includes(searchTerm) ||
      client.date.includes(searchTerm) ||
      client.place.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClients(results);
  }, [searchTerm, clients]);

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
              <p className="text-blue-100 mt-1">
                {filteredClients.length} {filteredClients.length === 1 ? 'client' : 'clients'} found
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-4 bg-white border-b border-gray-200">
            <div className="relative">
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
          </div>
        </div>

        {/* Client Cards */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredClients.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="mx-auto bg-white p-6 rounded-xl shadow-md max-w-md">
                <FiUser className="mx-auto text-gray-300 text-5xl mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-1">
                  {searchTerm ? 'No matching clients found' : 'No clients available'}
                </h3>
                <p className="text-sm text-gray-400">
                  {searchTerm ? 'Try a different search term' : 'Check back later or add new clients'}
                </p>
              </div>
            </div>
          ) : (
            filteredClients.map((client) => (
              <div
                key={client.id}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group relative"
              >
                {/* New badge for today's entries */}
                {client.date === today && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md animate-pulse">
                    NEW
                  </div>
                )}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
                <div className="p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-14 w-14 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors">
                      <FiUser className="text-blue-600 text-2xl group-hover:text-indigo-700 transition-colors" />
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {client.clientName}
                      </h3>
                      <div className="flex items-center mt-1 text-sm text-gray-600">
                        <FiHash className="flex-shrink-0 mr-1.5 text-gray-400" />
                        <span className="truncate">{client.clientId}</span>
                      </div>
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