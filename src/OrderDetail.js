import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import './OrderDetail.css';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const docRef = doc(db, 'orders', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOrder({
            id: docSnap.id,
            ...docSnap.data(),
            createdAt: docSnap.data().createdAt?.seconds || 0
          });
        }
      } catch (error) {
        console.error('Sipariş verisi alınamadı:', error);
      }
    };

    fetchOrder();
  }, [id]);

  if (!order) return <p className="empty">⏳ Sipariş yükleniyor...</p>;

  return (
    <div className="container">
      <h2 className="title">🧾 Sipariş Detayı</h2>
      <p className="line">📅 {new Date(order.createdAt * 1000).toLocaleDateString("tr-TR")}</p>
      <p className="line">🧾 Müşteri: {order.customerName}</p>
      <p className="line">🧍‍♂️ Sürücü: {order.driverName} - {order.driverPhone}</p>
      <p className="line">🚚 Araç: {order.vehicleType} - {order.vehiclePlate}</p>
      <p className="line">📦 Taşıma Tipi: {order.shipmentType}</p>
      <p className="line">⚖️ Toplam Ağırlık: {order.totalWeight} kg</p>
      {order.products && (
        <div className="products">
          <strong className="subTitle">🛒 Ürünler:</strong>
          {order.products.map((p, i) => (
            <p key={i} className="product">
              • {p.productName} ({p.palletCount} palet, {p.weight} kg)
            </p>
          ))}
        </div>
      )}
      <p className="note">📝 Not: {order.deliveryNote || "Belirtilmemiş"}</p>
    </div>
  );
}
