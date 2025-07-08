import React, { useEffect, useState } from "react";
import {
  fetchAllPacksStudent,
  fetchAllPacksAdmin,
  subscribeToPack,
  fetchMyPack,
} from "../api/packs";
import { RESPONSE_MESSAGES } from "../utils/responseMessages";

const PackList: React.FC<{ userRole?: string }> = ({ userRole }) => {
  const [packs, setPacks] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [myPackId, setMyPackId] = useState<string | null>(null);
  // For student subscription
  const [selectedOffer, setSelectedOffer] = useState<{ [packId: string]: string }>({});
  const [reductionCodes, setReductionCodes] = useState<{ [packId: string]: string }>({});
  const [subscribingPackId, setSubscribingPackId] = useState<string | null>(null);

  useEffect(() => {
    if (userRole === "admin" || userRole === "superadmin") {
      fetchAllPacksAdmin().then((reponse) => {
        if (reponse.success) {
          setPacks(Array.isArray(reponse.data) ? reponse.data : []);
        } else {
          setMessage(reponse.error || "Erreur lors de la récupération des packs.");
        }
      });
    } else {
      fetchAllPacksStudent().then((response) => {
        if (response.success) {
          setPacks(Array.isArray(response.data) ? response.data : []);
        } else {
          setMessage(response.error || "Erreur lors de la récupération des packs.");
        }
      });

      fetchMyPack().then((response) => {
        if (response.success && response.data && response.data.id) {
          setMyPackId(response.data.id);
        } else {
          setMyPackId(null);
          setMessage(response.error || "Erreur lors de la récupération de votre pack.");
        }
      });
    }
  }, [userRole]);

  const handleSubscribe = async (
    packId: string,
    offerId: string,
    reductionCode: string,
    force = false
  ) => {
    setSubscribingPackId(packId);
    const res = await subscribeToPack(packId, offerId, reductionCode, force);

    if (res.success) {
      setMyPackId(packId);
      setMessage(RESPONSE_MESSAGES.CONGRATULATION_PACK);
      setSubscribingPackId(null);
      return;
    }

    const error = res?.error;

    if (res.status === 401) {
      await handleSubscribe(packId, offerId, reductionCode, true);
    } else if (res.status === 404) {
      setMessage(RESPONSE_MESSAGES.NO_ENOUGH_CREDIT);
    } else {
      setMessage(error || "Une erreur est survenue.");
    }
    setSubscribingPackId(null);
  };

  return (
    <div>
      <h2>Available Packs</h2>
      {packs?.map((pack) => (
        <div key={pack.id} style={{ border: "1px solid #ccc", margin: 8, padding: 8 }}>
          <h3>{pack.name}</h3>
          <p>{pack.description}</p>
          <h4>Offers:</h4>
          {Array.isArray(pack.offers) && pack.offers.length > 0 ? (
            <ul>
              {pack.offers.map((offer: any) => (
                <li key={offer.id}>
                  {offer.durationMonths} months - {offer.price} €
                </li>
              ))}
            </ul>
          ) : (
            <p>No offers available.</p>
          )}
          {/* <h4>Courses:</h4>
          <ul>
            {pack.courses?.map((c: any) => (
              <li key={c.id}>{c.title}</li>
            ))}
          </ul> */}
          {userRole === "student" &&
            (myPackId === pack.id ? (
              <button disabled>Already Subscribed</button>
            ) : (
              <div>
                <label>
                  Select Offer:
                  <select
                    value={selectedOffer[pack.id] || ""}
                    onChange={(e) =>
                      setSelectedOffer({ ...selectedOffer, [pack.id]: e.target.value })
                    }
                  >
                    <option value=''>Choose an offer</option>
                    {pack.offers?.map((offer: any) => (
                      <option key={offer.id} value={offer.id}>
                        {offer.durationMonths} months - {offer.price} €
                      </option>
                    ))}
                  </select>
                </label>
                <br />
                <label>
                  Reduction Code (optional):
                  <input
                    type='text'
                    value={reductionCodes[pack.id] || ""}
                    onChange={(e) =>
                      setReductionCodes({ ...reductionCodes, [pack.id]: e.target.value })
                    }
                    placeholder='Reduction code'
                  />
                </label>
                <br />
                <button
                  onClick={() =>
                    handleSubscribe(pack.id, selectedOffer[pack.id], reductionCodes[pack.id] || "")
                  }
                  disabled={!selectedOffer[pack.id] || subscribingPackId === pack.id}
                >
                  {subscribingPackId === pack.id ? "Subscribing..." : "Request Subscription"}
                </button>
              </div>
            ))}
        </div>
      ))}
      {message && <p>{message}</p>}
    </div>
  );
};

export default PackList;
