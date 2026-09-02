import { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setWallpaperId } from '../../features/wallpaper/wallpaperSlice'
import { BUILTIN_WALLPAPERS } from "../../conf/wallpaperConf"
import { deleteWallpaperBlob, getCustomWallpapers, saveWallpaperBlob } from "../../conf/wallpaperStorageService";

const Wallpaper = () => {
    const dispatch = useDispatch();
    const wallpaperId = useSelector(state => state.wall.wallpaperId);

    const inputFileRef = useRef(null);

    const [wallpapers, setWallpapers] = useState(BUILTIN_WALLPAPERS);
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        getCustomWallpapers()
            .then(customWallpapers => {
                setWallpapers([...customWallpapers, ...BUILTIN_WALLPAPERS])
            })
            .catch(err => console.error('Failed to load custom wallpapers', err))
            .finally(() => setIsLoading(false));
    }, [])

    const customBg = useMemo(
        () => wallpapers.filter(wallpaper => wallpaper.type === "custom"),
        [wallpapers]
    );

    const builtInBg = useMemo(
        () => wallpapers.filter(wallpaper => wallpaper.type === "builtin"),
        [wallpapers]
    )

    const selectWallpaper = (id) => {
        dispatch(setWallpaperId(id))
        localStorage.setItem("CURRENT_WALLPAPER_ID", id);
    };

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            console.warn("Only image files are allowed");
            e.target.value = ""
            return
        };

        const id = crypto.randomUUID();
        try {
            await saveWallpaperBlob(id, file.name, file)
            const objectURL = URL.createObjectURL(file)

            const newWallpaper = {
                id,
                name: file.name,
                type: "custom",
                thumbnail: objectURL,
                full: objectURL,
            }

            setWallpapers(prev => [newWallpaper, ...prev])
            selectWallpaper(id);
        } catch (err) {
            console.error('Failed to save wallpaper', err);
        }
        e.target.value = ""
    };

    const handleDelete = async (event, id) => {
        event.stopPropagation();

        try {
            await deleteWallpaperBlob(id)
            setWallpapers(prev => prev.filter(wallpaper => wallpaper.id !== id))

            if (wallpaperId === id) {
                selectWallpaper("lofi-bg")
            }
        } catch (error) {
            console.error("Failed to delete wallpaper", err);
        }
    }

    const renderGrid = (items) => (
        <div className="@container">
            <div className="grid grid-cols-2 gap-2 @min-[500px]:grid-cols-3 @min-[700px]:grid-cols-4 @min-[900px]:grid-cols-5">
                {items.map(wallpaper => {
                    const isSelected = wallpaperId === wallpaper.id;

                    return (
                        <div
                            key={wallpaper.id}
                            onClick={() => selectWallpaper(wallpaper.id)}
                            className={`
                                group relative aspect-video cursor-pointer rounded-md overflow-hidden transition-all duration-200
                                ${isSelected ? "ring-2 ring-white/80" : "opacity-80 hover:opacity-100"}
                            `}
                        >
                            <img
                                src={wallpaper.thumbnail}
                                alt={wallpaper.name}
                                loading="lazy"
                                className="w-full h-full object-cover"
                            />

                            {/* Selected overlay */}
                            {isSelected && (
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                    <span className="text-white text-lg">✓</span>
                                </div>
                            )}

                            {wallpaper.type === "custom" && (
                                <button
                                    type="button"
                                    aria-label="Delete wallpaper"
                                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/10 transition cursor-pointer"
                                    onClick={(e) => handleDelete(e, wallpaper.id)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash2-icon lucide-trash-2 text-white/60 hover:text-red-500 transition"><path d="M10 11v6" /><path d="M14 11v6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <section>
                <button
                    type="button"
                    className="bg-white/10 hover:bg-white/20 rounded-lg py-2 px-3 flex items-center gap-2 text-sm text-white font-semibold transition-all duration-200 cursor-pointer"
                    onClick={() => inputFileRef.current?.click()}
                >
                    Upload
                    <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus-icon lucide-plus"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                    </span>
                </button>

                <input
                    ref={inputFileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    hidden
                />
            </section>

            {/* Custom Wallpapers */}
            <section>
                <h3 className="text-xs font-semibold text-white/80 mb-2">
                    Your Wallpapers
                </h3>

                {isLoading ? (
                    <p className="text-xs text-white/40 italic">Loading…</p>
                ) : customBg.length === 0 ? (
                    <p className="text-xs text-white/40 italic">No custom wallpapers yet</p>
                ) : (
                    renderGrid(customBg)
                )}
            </section>

            {/* Built-in Wallpapers */}
            <section>
                <h3 className="text-xs font-semibold text-white/80 mb-2">
                    Built-in Wallpapers
                </h3>

                {renderGrid(builtInBg)}
            </section>

        </div>
    )
}

export default Wallpaper