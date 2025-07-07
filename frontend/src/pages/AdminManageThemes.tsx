import React, { useState, useEffect } from "react";
import { fetchAllThemes, fetchThemeById, createTheme, updateTheme, deleteTheme } from "../api/theme";
import { fetchAllPacksAdmin } from "../api/packs";
import { RESPONSE_MESSAGES } from "../utils/responseMessages";

const AdminManageThemes: React.FC = () => {
    const [themes, setThemes] = useState<any[]>([]);
    const [selectedTheme, setSelectedTheme] = useState<any>(null);
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [themeId, setThemeId] = useState("");
    const [allPacks, setAllPacks] = useState<any[]>([]);
    const [selectedPackIds, setSelectedPackIds] = useState<string[]>([]);

    const fetchThemes = async () => {
        setLoading(true);
        const response = await fetchAllThemes();
        if (!response.success) {
            setMessage(response.error || "Failed to load themes.");
            setLoading(false);
            return;
        }
        setThemes(Array.isArray(response?.data) ? response?.data : []);
        setLoading(false);
    };

    const fetchPacks = async () => {
        const response = await fetchAllPacksAdmin();
        if (response.success) {
            setAllPacks(Array.isArray(response.data) ? response.data : []);
        }
    };

    useEffect(() => {
        fetchThemes();
        fetchPacks();
        // eslint-disable-next-line
    }, []);

    const handleCreateTheme = async () => {
        setIsCreating(true);
        const response = await createTheme({ title, packIds: selectedPackIds });
        setIsCreating(false);
        if (!response.success) {
            setMessage(response.error || "Failed to create theme.");
            return;
        }
        setThemes([...themes, response.data]);
        setTitle("");
        setSelectedPackIds([]);
    };

    const handleEditTheme = async () => {
        if (!themeId) return;
        setIsEditing(true);
        const response = await updateTheme(themeId, { title, packIds: selectedPackIds });
        setIsEditing(false);
        if (!response.success) {
            setMessage(response.error || "Failed to update theme.");
            return;
        }
        setThemes(themes.map((theme) => (theme.id === themeId ? response.data : theme)));
        setTitle("");
        setThemeId("");
        setSelectedTheme(null);
        setSelectedPackIds([]);
    };

    const handleDeleteTheme = async (id: string) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this theme?");
        if (!confirmDelete) return;

        const response = await deleteTheme(id);
        if (!response.success) {
            setMessage(response.error || "Failed to delete theme.");
            return;
        }
        setThemes(themes.filter((theme) => theme.id !== id));
        if (themeId === id) {
            setThemeId("");
            setSelectedTheme(null);
            setTitle("");
            setSelectedPackIds([]);
        }
    };

    const handleSelectTheme = async (id: string) => {
        const response = await fetchThemeById(id);
        if (!response.success) {
            setMessage(response.error || "Failed to fetch theme.");
            return;
        }
        setSelectedTheme(response.data);
        setTitle(response.data.title);
        setThemeId(id);
        setSelectedPackIds(
            response.data.packs ? response.data.packs.map((p: any) => p.id) : []
        );
    };

    return (
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <h2>Admin: Manage Themes</h2>
            {message && <p style={{ color: "red" }}>{message}</p>}
            <div>
                <h3>Create Theme</h3>
                <input
                    type="text"
                    placeholder="Theme Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <div>
                    <label>Packs associés :</label>
                    <select
                        multiple
                        value={selectedPackIds}
                        onChange={e => {
                            const selected = Array.from(e.target.selectedOptions, option => option.value);
                            setSelectedPackIds(selected);
                        }}
                        style={{ width: "100%", minHeight: 60 }}
                    >
                        {allPacks.map(pack => (
                            <option key={pack.id} value={pack.id}>
                                {pack.name}
                            </option>
                        ))}
                    </select>
                </div>
                <button onClick={handleCreateTheme} disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create Theme"}
                </button>
            </div>
            <div>
                <h3>Edit Theme</h3>
                <select onChange={(e) => handleSelectTheme(e.target.value)} value={themeId}>
                    <option value="">Select a theme to edit</option>
                    {themes.map((theme) => (
                        <option key={theme.id} value={theme.id}>
                            {theme.title}
                        </option>
                    ))}
                </select>
                {selectedTheme && (
                    <>
                        <input
                            type="text"
                            placeholder="Theme Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                        <div>
                            <label>Packs associés :</label>
                            <select
                                multiple
                                value={selectedPackIds}
                                onChange={e => {
                                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                                    setSelectedPackIds(selected);
                                }}
                                style={{ width: "100%", minHeight: 60 }}
                            >
                                {allPacks.map(pack => (
                                    <option key={pack.id} value={pack.id}>
                                        {pack.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button onClick={handleEditTheme} disabled={isEditing}>
                            {isEditing ? "Updating..." : "Update Theme"}
                        </button>
                        <button onClick={() => handleDeleteTheme(selectedTheme.id)}>
                            Delete Theme
                        </button>
                    </>
                )}
            </div>
            <div>
                <h3>Existing Themes</h3>
                {loading ? (
                    <p>Loading themes...</p>
                ) : (
                    themes.map((theme) => (
                        <div key={theme.id}>
                            <h4>{theme.title}</h4>
                            {theme.packs && theme.packs.length > 0 && (
                                <div>
                                    <strong>Packs associés :</strong>
                                    <ul>
                                        {theme.packs.map((pack: any) => (
                                            <li key={pack.id}>{pack.name}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <button onClick={() => handleSelectTheme(theme.id)}>Edit</button>
                            <button onClick={() => handleDeleteTheme(theme.id)}>Delete</button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
export default AdminManageThemes;