import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchCourses } from "../api/courses";
import { createPack, updatePack, fetchPackById, subscribeToPack } from "../api/packs";
import { RESPONSE_MESSAGES } from "../utils/responseMessages";

const PACK_TYPES = [
  "2eme info", "3eme info", "Bac info", "Bac scientifique",
  "2eme info gratuit", "3eme info gratuit", "Bac info gratuit", "Bac scientifique gratuit"
];

const AdminPackForm: React.FC<{ onSave?: () => void }> = ({ onSave }) => {
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [packType, setPackType] = useState(PACK_TYPES[0]);
  const [courseIds, setCourseIds] = useState<string[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(!!id);
  const [notFound, setNotFound] = useState(false);
  const [pack, setPack] = useState<any>(null);

  // Offers state
  const [offers, setOffers] = useState<{ id?: string; durationMonths: number; price: number }[]>([]);
  const [offerDuration, setOfferDuration] = useState(3);
  const [offerPrice, setOfferPrice] = useState(0);

  // For demo subscription section
  const [selectedOfferId, setSelectedOfferId] = useState("");
  const [reductionCode, setReductionCode] = useState("");
  const [subscribeMsg, setSubscribeMsg] = useState("");

  // Fetch courses always
  useEffect(() => {
    fetchCourses().then((response) => {
      if (response.success) {
        setCourses(Array.isArray(response?.data) ? response?.data : []);
      } else {
        setCourses([]);
      }
    });
  }, []);

  // Fetch pack if editing
  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchPackById(id).then((response) => {
        setLoading(false);
        if (response.success) {
          const fetchedPack = response.data;
          setPack(fetchedPack);
          setName(fetchedPack.name);
          setDescription(fetchedPack.description || "");
          setPackType(fetchedPack.type || PACK_TYPES[0]);
          setCourseIds(
            fetchedPack.courses ? fetchedPack.courses.map((c: any) => c.id) : []
          );
          setOffers(fetchedPack.offers || []);
        } else {
          setNotFound(true);
        }
      });
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      setName("");
      setDescription("");
      setPackType(PACK_TYPES[0]);
      setCourseIds([]);
      setOffers([]);
      setMessage("");
      setNotFound(false);
      setLoading(false);
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name,
      description,
      type: packType,
      courseIds,
      offers,
    };
    const res = id ? await updatePack(id, data) : await createPack(data);
    setMessage(res.error || RESPONSE_MESSAGES.PACK_SAVED);
    if (onSave) onSave();
  };

  const handleCourseToggle = (cid: string) => {
    setCourseIds((ids) => (ids.includes(cid) ? ids.filter((id) => id !== cid) : [...ids, cid]));
  };

  const handleAddOffer = () => {
    setOffers([...offers, { durationMonths: offerDuration, price: offerPrice }]);
    setOfferDuration(3);
    setOfferPrice(0);
  };
  const handleRemoveOffer = (idx: number) => {
    setOffers(offers.filter((_, i) => i !== idx));
  };

  // Demo: subscribe to pack with offer and reduction code
  const handleSubscribeDemo = async () => {
    setSubscribeMsg("");
    if (!pack?.id || !selectedOfferId) return;
    const res = await subscribeToPack(pack.id, selectedOfferId, reductionCode);
    setSubscribeMsg(res.success ? "Subscription successful!" : res.error || "Subscription failed.");
  };

  // Only show form if:
  // - Creating (no id)
  // - Editing and pack exists (not loading and not notFound)
  if (id && loading) return <div>Loading...</div>;
  if (id && notFound) return <div>Pack not found.</div>;

  return (
    <form onSubmit={handleSubmit}>
      <h2>{id ? "Modifier" : "Créer"} Pack</h2>

      <label>
        Nom du Pack:
        <br />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='Nom du Pack'
          required
        />
      </label>
      <br />

      <label>
        Description:
        <br />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder='Description'
        />
      </label>
      <br />

      <label>
        Type de Pack:
        <br />
        <select value={packType} onChange={(e) => setPackType(e.target.value)}>
          {PACK_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>
      <br />

      <h4>Cours</h4>
      {courses.length === 0 && <p>Aucun cours disponible</p>}
      {courses.map((c) => (
        <label key={c.id} style={{ display: "block" }}>
          <input
            type='checkbox'
            checked={courseIds.includes(c.id)}
            onChange={() => handleCourseToggle(c.id)}
          />
          {c.title}
        </label>
      ))}
      <br />

      <h4>Offres</h4>
      {offers.length === 0 && <p>Aucune offre disponible</p>}
      {offers.map((offer, idx) => (
        <div key={idx} style={{ marginBottom: "10px" }}>
          <strong>Offre {idx + 1}:</strong>
          <div>
            Durée (mois):
            <input
              type='number'
              value={offer.durationMonths}
              onChange={(e) => {
                const newDuration = Number(e.target.value);
                setOffers(
                  offers.map((o, i) => (i === idx ? { ...o, durationMonths: newDuration } : o))
                );
              }}
              min={1}
              style={{ width: "60px", marginLeft: "5px" }}
            />
          </div>
          <div>
            Prix (TND):
            <input
              type='number'
              value={offer.price}
              onChange={(e) => {
                const newPrice = Number(e.target.value);
                setOffers(offers.map((o, i) => (i === idx ? { ...o, price: newPrice } : o)));
              }}
              min={0}
              style={{ width: "60px", marginLeft: "5px" }}
            />
          </div>
          <button type='button' onClick={() => handleRemoveOffer(idx)}>
            Remove Offer
          </button>
        </div>
      ))}
      <div style={{ marginBottom: "10px" }}>
        <strong>Ajouter une nouvelle offre :</strong>
        <div>
          Durée (mois):
          <input
            type='number'
            value={offerDuration}
            onChange={(e) => setOfferDuration(Number(e.target.value))}
            min={1}
            style={{ width: "60px", marginLeft: "5px" }}
          />
        </div>
        <div>
          Prix (€):
          <input
            type='number'
            value={offerPrice}
            onChange={(e) => setOfferPrice(Number(e.target.value))}
            min={0}
            style={{ width: "60px", marginLeft: "5px" }}
          />
        </div>
        <button type='button' onClick={handleAddOffer}>
          Ajouter une offre
        </button>
      </div>
      <button type='submit'>{id ? "Modifier" : "Créer"}</button>
      {message && <p>{message}</p>}

      {/* Demo: Subscribe to pack with offer and reduction code */}
      {pack && pack.offers && pack.offers.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h4>Subscribe to Pack (Demo)</h4>
          <label>
            Select Offer:
            <br />
            <select
              value={selectedOfferId}
              onChange={(e) => setSelectedOfferId(e.target.value)}
            >
              <option value=''>Select offer</option>
              {pack.offers.map((offer: any) => (
                <option key={offer.id} value={offer.id}>
                  {offer.durationMonths} months - {offer.price} €
                </option>
              ))}
            </select>
          </label>
          <br />
          <label>
            Reduction Code (optional):
            <br />
            <input
              type='text'
              value={reductionCode}
              onChange={(e) => setReductionCode(e.target.value)}
              placeholder='Reduction code (optional)'
            />
          </label>
          <br />
          <button
            type="button"
            onClick={handleSubscribeDemo}
            disabled={!selectedOfferId}
          >
            Subscribe
          </button>
          {subscribeMsg && <p>{subscribeMsg}</p>}
        </div>
      )}
    </form>
  );
};

export default AdminPackForm;