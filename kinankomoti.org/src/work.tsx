import { useEffect, useState } from "react"

export interface WorkMeta {
    title: string
    thumbnail: string
    date: string
    tags: string[]
}

export interface WorkData extends WorkMeta {
    slug: string
    Component: React.FC
}

interface WorkItem extends WorkMeta {
    slug: string
    Component: React.FC
}

export async function getWorks(): Promise<WorkData[]> {
    const modules = import.meta.glob("./work/*.mdx")

    console.log("loaded modules:", modules)

    const works = await Promise.all(
        Object.entries(modules).map(async ([path, resolver]) => {
            const mod: any = await resolver()
            const slug = path.split("/").pop()!.replace(".mdx", "")
            const meta = mod.meta ?? mod.frontmatter ?? {}

            return {
                slug,
                ...meta,
                Component: mod.default
            }
        })
    )

    // 日付降順
    works.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return works
}

export default function WorkList() {
    const [works, setWorks] = useState<WorkItem[]>([])
    const [selected, setSelected] = useState<WorkItem | null>(null)

    useEffect(() => {
        async function load() {
            const modules = import.meta.glob("./work/*.mdx")

            const loaded = await Promise.all(
                Object.entries(modules).map(async ([path, resolver]) => {
                    const mod: any = await resolver()
                    const meta = mod.meta ?? mod.frontmatter ?? {}

                    const slug = path.split("/").pop()!.replace(".mdx", "")

                    return {
                        slug,
                        ...meta,
                        Component: mod.default
                    } as WorkItem
                })
            )

            loaded.sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )

            setWorks(loaded)
        }

        load()
    }, [])

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                alignItems: "start",
            }}
        >
            <div
                style={{
                    display: "grid",
                    gap: "12px",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                }}
            >
                {works.map((w) => {
                    const isActive = selected?.slug === w.slug
                    return (
                        <button
                            key={w.slug}
                            onClick={() => setSelected((prev) => (prev?.slug === w.slug ? null : w))}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                                textAlign: "left",
                                background: isActive ? "#171717" : "#0f0f0f",
                                border: isActive ? "1px solid #333" : "1px solid #222",
                                borderRadius: "10px",
                                cursor: "pointer",
                                padding: "10px",
                                transition: "border-color 140ms ease, background 140ms ease, transform 140ms ease",
                                transform: isActive ? "translateY(-1px)" : "translateY(0)",
                            }}
                        >
                            <div
                                style={{
                                    position: "relative",
                                    width: "100%",
                                    aspectRatio: "1 / 1",
                                    overflow: "hidden",
                                    borderRadius: "8px",
                                    background: "#111",
                                }}
                            >
                                <img
                                    src={w.thumbnail}
                                    alt={w.title}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        display: "block",
                                    }}
                                />
                            </div>
                            <div>
                                <h2 style={{ margin: "0 0 4px" }}>{w.title}</h2>
                                <div style={{ color: "#888", fontSize: "12px" }}>{w.date}</div>
                            </div>
                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                {w.tags?.map((t) => (
                                    <span
                                        key={t}
                                        style={{
                                            padding: "4px 8px",
                                            borderRadius: "999px",
                                            background: "#1a1a1a",
                                            border: "1px solid #222",
                                            fontSize: "12px",
                                        }}
                                    >
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </button>
                    )
                })}
            </div>

            <div
                style={{
                    border: "1px solid #222",
                    borderRadius: "10px",
                    padding: "16px",
                    background: "#0f0f0f",
                    minHeight: "320px",
                }}
            >
                {selected ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <button
                            onClick={() => setSelected(null)}
                            style={{
                                alignSelf: "flex-end",
                                background: "transparent",
                                color: "#bbb",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "14px",
                            }}
                            aria-label="閉じる"
                        >
                            ✕
                        </button>
                        <div
                            style={{
                                position: "relative",
                                width: "100%",
                                aspectRatio: "1 / 1",
                                overflow: "hidden",
                                borderRadius: "8px",
                                background: "#111",
                            }}
                        >
                            <img
                                src={selected.thumbnail}
                                alt={selected.title}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    display: "block",
                                }}
                            />
                        </div>
                        <div>
                            <h2 style={{ margin: "4px 0 6px" }}>{selected.title}</h2>
                            <div style={{ color: "#888", fontSize: "12px" }}>{selected.date}</div>
                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
                                {selected.tags?.map((t) => (
                                    <span
                                        key={t}
                                        style={{
                                            padding: "4px 8px",
                                            borderRadius: "999px",
                                            background: "#1a1a1a",
                                            border: "1px solid #222",
                                            fontSize: "12px",
                                        }}
                                    >
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div style={{ paddingTop: "4px" }}>
                            <selected.Component />
                        </div>
                    </div>
                ) : (
                    <div style={{ color: "#777", textAlign: "center", padding: "40px 0" }}>
                    </div>
                )}
            </div>
        </div>
    )
}
