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
    return (
        <>
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
                    src={work.thumbnail}
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
                            borderRadius: "999px",
                            background: "#1a1a1a",
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
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "1 / 1",
                overflow: "hidden",
                borderRadius: "10px",
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
              <h2 style={{ margin: "8px 0 6px" }}>{selected.title}</h2>
              <div style={{ color: "#888", fontSize: "12px" }}>{selected.date}</div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
                {selected.tags?.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "999px",
                      background: "#1a1a1a",
                      border: "1px solid #222",
                      fontSize: "12px",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="work-modal-detail">
            <selected.Component />
          </div>
        </div>
      </div>
    </div>
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
          className={`work-modal-shell${isOpen ? " is-open" : ""}${
            isClosing ? " is-closing" : ""
          }`}
        >
          {renderWorkModal(selected, closeModal)}
        </div>
      ) : null}
    </div>
  );
}
