import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { db } from './firebase';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import './OrderList.css';

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'orders'));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.seconds || 0
      }));
      const sorted = data.sort((a, b) => b.createdAt - a.createdAt);
      setOrders(sorted);
    } catch (error) {
      console.error('Veri çekme hatası:', error);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Bu siparişi silmek istediğine emin misin?")) {
      try {
        await deleteDoc(doc(db, 'orders', id));
        fetchOrders();
      } catch (error) {
        console.error('Silme hatası:', error);
      }
    }
  };

  const handleSelectOrder = (id) => {
    setSelectedOrders(prev =>
      prev.includes(id) ? prev.filter(orderId => orderId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(order => order.id));
    }
    setSelectAll(!selectAll);
  };

  const handleDeleteSelected = async () => {
    if (selectedOrders.length === 0) return;
    if (window.confirm(`${selectedOrders.length} siparişi silmek istediğinize emin misiniz?`)) {
      try {
        await Promise.all(
          selectedOrders.map(id => deleteDoc(doc(db, 'orders', id)))
        );
        setSelectedOrders([]);
        setSelectAll(false);
        fetchOrders();
      } catch (error) {
        console.error('Toplu silme hatası:', error);
      }
    }
  };

  const exportToExcel = () => {
    const data = [];
    orders.forEach(order => {
      if (order.products && order.products.length > 0) {
        order.products.forEach(product => {
          data.push({
            'Tarih': new Date(order.createdAt * 1000).toLocaleDateString('tr-TR'),
            'Saat': new Date(order.createdAt * 1000).toLocaleTimeString('tr-TR'),
            'Order ID': order.id,
            'Siparişi Oluşturan' : order.orderCreator,
            'Müşteri Adı': order.customerName,
            'Plaka': order.vehiclePlate,
            'Sürücü': order.driverName,
            'Telefon' : order.driverPhone,
            'Taşıma Tipi': order.shipmentType,
            'Ürün': product.productName,
            'Palet Sayısı': product.palletCount,
            'Ürün Ağırlığı (kg)': product.weight,
            'Toplam Sipariş Ağırlığı': order.totalWeight,
            'Not': order.deliveryNote || '',
          });
        });
      } else {
        data.push({
          'Order ID': order.id,
          'Siparişi Oluşturan' : order.orderCreator,
          'Müşteri Adı': order.customerName,
          'Araç': `${order.vehicleType} - ${order.vehiclePlate}`,
          'Sürücü': `${order.driverName} (${order.driverPhone})`,
          'Taşıma Tipi': order.shipmentType,
          'Ürün': '',
          'Palet Sayısı': '',
          'Ürün Ağırlığı (kg)': '',
          'Toplam Sipariş Ağırlığı': order.totalWeight,
          'Not': order.deliveryNote || '',
          'Tarih': new Date(order.createdAt * 1000).toLocaleDateString('tr-TR'),
          'Saat': new Date(order.createdAt * 1000).toLocaleTimeString('tr-TR')
        });
      }
    });

    const worksheet = XLSX.utils.json_to_sheet(data);

    worksheet['!cols'] = [
      { wch: 15 }, // Order ID
      { wch: 20 }, // Sipariş Sahibi
      { wch: 25 }, // Araç
      { wch: 25 }, // Sürücü
      { wch: 18 }, // Taşıma Tipi
      { wch: 30 }, // Ürün
      { wch: 15 }, // Palet Sayısı
      { wch: 20 }, // Ürün Ağırlığı
      { wch: 20 }, // Toplam Ağırlık
      { wch: 20 }, // Not
      { wch: 20 }, // Tarih
      { wch: 15 }  // Saat
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Siparişler');
    XLSX.writeFile(workbook, 'siparisler.xlsx');
  };

  const filteredOrders = orders.filter(order =>
    order.products?.some(product =>
      product.productName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  useEffect(() => {
    // Eğer filtre değişirse, seçili olanları güncelle
    if (selectAll) {
      setSelectedOrders(filteredOrders.map(order => order.id));
    }
  }, [filteredOrders, selectAll]);

  return (
    <div className="container">
      <button className="export-btn" onClick={exportToExcel}>📤 Excel'e Aktar</button>
      <input
        type="text"
        className="search-bar"
        placeholder="🔍 Ürün adına göre ara..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <div style={{ margin: '10px 0' }}>
        <input
          type="checkbox"
          checked={selectAll}
          onChange={handleSelectAll}
        /> Tümünü Seç
        <button
          className="delete"
          style={{ marginLeft: 10 }}
          onClick={handleDeleteSelected}
          disabled={selectedOrders.length === 0}
        >
          Seçilenleri Sil
        </button>
      </div>
      {filteredOrders.length === 0 ? (
        <p className="empty">🙈 Oppsss! Hiç veri yok</p>
      ) : (
        <div className="list">
          {filteredOrders.map(order => (
            <div key={order.id} className="card" onClick={() => navigate(`/order/${order.id}`)} style={{ cursor: 'pointer', position: 'relative' }}>
              <input
                type="checkbox"
                checked={selectedOrders.includes(order.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  handleSelectOrder(order.id);
                }}
                style={{ position: 'absolute', left: 10, top: 10 }}
              />
              <div className="top-row">
                <span className="date">📅 {new Date(order.createdAt * 1000).toLocaleDateString('tr-TR')}</span>
                <button className="delete" onClick={(e) => handleDelete(order.id, e)}>🗑️</button>
              </div>
              <h3 className="title">{order.orderCreator}</h3>
              <p className="line">🧾 Sipariş Sahibi: {order.customerName}</p>
              <p className="line">🚚 Araç: {order.vehicleType} - {order.vehiclePlate}</p>
              <p className="line">🧍‍♂️ Sürücü: {order.driverName} ({order.driverPhone})</p>
              <p className="line">📦 Taşıma Tipi: {order.shipmentType}</p>
              <p className="line">⚖️ Toplam Ağırlık: {order.totalWeight} kg</p>
              {order.products && (
                <div className="product-section">
                  <strong className="subTitle">🛒 Ürünler:</strong>
                  {order.products.map((p, idx) => (
                    <p key={idx} className="product-text">
                      • {p.productName} — {p.palletCount} palet, {p.weight} kg
                    </p>
                  ))}
                </div>
              )}
              <p className="note">📝 Not: {order.deliveryNote || "Belirtilmemiş"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}