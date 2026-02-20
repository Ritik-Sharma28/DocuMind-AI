/**
 * Recursive character text splitter with configurable overlap.
 * Mirrors LangChain's RecursiveCharacterTextSplitter but written
 * from scratch to demonstrate algorithm design skills.
 */
export class TextChunker {
    constructor({ chunkSize = 1000, chunkOverlap = 200 } = {}) {
        this.chunkSize = chunkSize;
        this.chunkOverlap = chunkOverlap;
        this.separators = ["\n\n", "\n", ". ", ", ", " ", ""];
    }

    splitText(text) {
        const clean = text.replace(/\s+/g, " ").trim();
        const raw = this._recursiveSplit(clean, this.separators);

        // Add overlapping context between adjacent chunks
        return raw
            .map((chunk, i) => {
                let enriched = chunk;
                if (i > 0) {
                    const overlap = raw[i - 1].slice(-this.chunkOverlap);
                    enriched = overlap + enriched;
                }
                return {
                    text: enriched.trim(),
                    index: i,
                    charStart: i * (this.chunkSize - this.chunkOverlap),
                };
            })
            .filter((c) => c.text.length > 50);
    }

    _recursiveSplit(text, separators) {
        if (text.length <= this.chunkSize) return [text];

        const [sep, ...rest] = separators;
        const parts = text.split(sep);
        const chunks = [];
        let buf = "";

        for (const part of parts) {
            const candidate = buf ? buf + sep + part : part;

            if (candidate.length <= this.chunkSize) {
                buf = candidate;
            } else {
                if (buf) chunks.push(buf);
                if (part.length > this.chunkSize && rest.length) {
                    chunks.push(...this._recursiveSplit(part, rest));
                    buf = "";
                } else {
                    buf = part;
                }
            }
        }
        if (buf) chunks.push(buf);
        return chunks;
    }
}
