import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import mdx from "@mdx-js/rollup"
import remarkFrontmatter from "remark-frontmatter"
import remarkMdxFrontmatter from "remark-mdx-frontmatter"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    mdx({
      remarkPlugins: [
        remarkFrontmatter,
        [remarkMdxFrontmatter, { name: "meta" }],
        remarkMath,
      ],
      rehypePlugins: [rehypeKatex],
    }),
    react({
      babel: {
        plugins: [
          [
            "babel-plugin-react-compiler",
            {
              name: "@mdx-js/rollup",
            },
          ],
        ],
      },
    }),
  ],
})
