import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'

const ResponseFormatter = ({ content }) => (
  <div className="text-left prose prose-sm max-w-[90%] overflow-hidden">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        p: props => <p className="mb-2 text-white leading-relaxed" {...props} />,
        h1: props => <h1 className="text-2xl font-bold text-theme-sky-blue mt-4 mb-2" {...props} />,
        h2: props => (
          <h2 className="text-xl font-semibold text-theme-sky-blue mt-3 mb-1" {...props} />
        ),
        li: props => <li className="list-disc list-inside" {...props} />,
        pre: props => (
          <pre className="bg-[#1e1e2f] text-white p-4 rounded overflow-auto" {...props} />
        ),
        code: ({ inline, children, ...props }) => (
          <code
            className={`text-sm rounded ${
              inline
                ? 'bg-[#1e1e2f] text-green-400 px-1 py-0.5'
                : 'block bg-[#1e1e2f] text-white p-2 my-2'
            }`}
            {...props}
          >
            {children}
          </code>
        ),
        table: props => (
          <table
            className="table-auto border-collapse border border-gray-700 text-white"
            {...props}
          />
        ),
        th: props => <th className="border border-gray-700 p-2 bg-[#2c2c3e]" {...props} />,
        td: props => <td className="border border-gray-700 p-2" {...props} />,
      }}
    >
      {content || '*AI has no response.*'}
    </ReactMarkdown>
  </div>
)

export default ResponseFormatter
