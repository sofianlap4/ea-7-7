import React, { useEffect, useState } from 'react';
import { fetchAllPacksAdmin, deletePack } from '../api/packs';
import { Link } from 'react-router-dom';
import { RESPONSE_MESSAGES } from '../utils/responseMessages';
import { response } from 'express';

const AdminPackList: React.FC = () => {
  const [packs, setPacks] = useState<any[]>([]);

  useEffect(() => {
    fetchAllPacksAdmin().then(response => {
      if (response.success) {
        setPacks(Array.isArray(response.data) ? response.data : []);
      } else {
        alert(response.error || 'Failed to fetch packs');
      }
    });
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm(RESPONSE_MESSAGES.SURE_DELETE_PACK)) {
      const response = await deletePack(id);
      if (response.success) {
        setPacks(packs.filter(pack => pack.id !== id));
      } else {
        alert(response.error || 'Failed to delete pack');
      }
    }
  };

  return (
    <div>
      <h2>Manage Packs</h2>
      <ul>
        {packs.map(pack => (
          <li key={pack.id}>
            <strong>{pack.name}</strong> - {pack.description}
            {" "}
            <Link to={`/admin/packs/${pack.id}/edit`}>Edit</Link> |{" "}
            <Link to={`/admin/packs/${pack.id}/students`}>Manage Students</Link> |{" "}
            <button onClick={() => handleDelete(pack.id)} style={{ color: 'red' }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPackList;