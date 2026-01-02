import { useEffect, useState } from "react";

export interface WorkMeta {
    title: string;
    thumbnail: string;
    date: string;
    tags: string[];
}

export interface WorkData extends WorkMeta {
    slug: string;
    Component: React.FC;
}

function getYouTubeId(url: string) {
    try {
        const parsed = new URL(url);
        const host = parsed.hostname.replace("www.", "");
        if (host === "youtu.be") {
            return parsed.pathname.replace("/", "");
        }
        if (host === "youtube.com" || host === "m.youtube.com") {
            if (parsed.pathname === "/watch") {
                return parsed.searchParams.get("v");
            }
            if (parsed.pathname.startsWith("/embed/")) {
                return parsed.pathname.split("/").pop() ?? null;
            }
        }
    } catch {
        return null;
    }
    return null;
}

function getYouTubeThumbnail(url: string) {
    const id = getYouTubeId(url);
    return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

export async function getWorks(): Promise<WorkData[]> {
    const modules = import.meta.glob("./work/*.mdx");

    const works = await Promise.all(
        Object.entries(modules).map(async ([path, resolver]) => {
            const mod: any = await resolver();
            const slug = path.split("/").pop()!.replace(".mdx", "");
            const meta = mod.meta ?? mod.frontmatter ?? {};

            return {
                slug,
                ...meta,
                Component: mod.default,
            } as WorkData;
        })
    );

    return works;
}

function renderWorkItem(work: WorkData) {
    const youtubeThumb = getYouTubeThumbnail(work.thumbnail);
    return (
        <>
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "1 / 1",
                    overflow: "hidden",
                    borderRadius: "0",
                    background: "#111",
                }}
            >
                <img
                    src={youtubeThumb ?? work.thumbnail}
                    alt={work.title}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                    }}
                />
            </div>
            <div>
                <h2 style={{ margin: "10px 0 6px" }}>{work.title}</h2>
                <div style={{ color: "#888", fontSize: "12px" }}>{work.date}</div>
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {work.tags?.map((tag) => (
                    <span
                        key={tag}
                        style={{
                            padding: "4px 8px",
                            borderRadius: "0",
                            background: "transparent",
                            border: "1px solid #222",
                            fontSize: "12px",
                        }}
                    >
                        {tag}
                    </span>
                ))}
            </div>
        </>
    );
}

function renderWorkModal(selected: WorkData, onClose: () => void) {
    const youtubeId = getYouTubeId(selected.thumbnail);
    const youtubeThumb = getYouTubeThumbnail(selected.thumbnail);
    return (
        <div className="work-modal-overlay" onClick={onClose} role="presentation">
            <div
                className="work-modal"
                role="dialog"
                aria-modal="true"
                aria-label={selected.title}
                onClick={(event) => event.stopPropagation()}
            >
                <button
                    className="work-modal-close"
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                >
                    ×
                </button>
                <div className="work-modal-body">
                    <div className="work-modal-meta">
                        {youtubeId ? (
                            <iframe
                                src={`https://www.youtube.com/embed/${youtubeId}`}
                                title={selected.title}
                                style={{
                                    width: "100%",
                                    aspectRatio: "16 / 9",
                                    border: "0",
                                    display: "block",
                                }}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            < div
                                style={{
                                    position: "relative",
                                    width: "100%",
                                    overflow: "hidden",
                                    borderRadius: "0",
                                    background: "#111",
                                }}
                            >
                                <img
                                    src={youtubeThumb ?? selected.thumbnail}
                                    alt={selected.title}
                                    style={{
                                        width: "100%",
                                        height: "auto",
                                        objectFit: "contain",
                                        display: "block",
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    <div className="work-modal-detail">
                        <div className="work-modal-meta-text">
                            <h2 className="work-modal-title">{selected.title}</h2>
                            <div className="work-modal-date">{selected.date}</div>
                            <div className="work-modal-tags">
                                {selected.tags?.map((tag) => (
                                    <span
                                        key={tag}
                                        style={{
                                            padding: "4px 8px",
                                            borderRadius: "0",
                                            background: "transparent",
                                            border: "1px solid #222",
                                            fontSize: "12px",
                                        }}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <selected.Component />
                    </div>
                </div>
            </div>
        </div >
    );
}

export default function WorkList() {
    const [works, setWorks] = useState<WorkData[]>([]);
    const [selected, setSelected] = useState<WorkData | null>(null);
    const [isClosing, setIsClosing] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        async function load() {
            const loaded = await getWorks();

            loaded.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setWorks(loaded);
        }

        load();
    }, []);

    const closeModal = () => {
        setIsOpen(false);
        setIsClosing(true);
        window.setTimeout(() => {
            setSelected(null);
            setIsClosing(false);
        }, 420);
    };

    const openModal = (work: WorkData) => {
        setSelected(work);
        setIsClosing(false);
        setIsOpen(false);
        window.requestAnimationFrame(() => {
            setIsOpen(true);
        });
    };

    return (
        <div className="work-wrapper">
            <div className="work-list">
                {works.map((work) => (
                    <button
                        key={work.slug}
                        className="work-card"
                        type="button"
                        onClick={() => openModal(work)}
                    >
                        {renderWorkItem(work)}
                    </button>
                ))}
            </div>
            {selected ? (
                <div
                    className={`work-modal-shell${isOpen ? " is-open" : ""}${isClosing ? " is-closing" : ""
                        }`}
                >
                    {renderWorkModal(selected, closeModal)}
                </div>
            ) : null}
        </div>
    );
}
