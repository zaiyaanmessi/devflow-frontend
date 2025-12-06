import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import api from '@/services/api';
import Sidebar from '@/components/Sidebar';
import { MdFormatListNumbered, MdFormatListBulleted } from 'react-icons/md';

interface AccordionSection {
  id: string;
  title: string;
  content: string[];
  isOpen: boolean;
}

export default function AskQuestion() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState('');
  const [imageDataMap, setImageDataMap] = useState<{ [key: string]: string }>({});
  const [bodyLength, setBodyLength] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [accordionSections, setAccordionSections] = useState<AccordionSection[]>([
    {
      id: 'summarize',
      title: "1. Summarize the problem",
      content: [
        "Include details about your goal",
        "Describe expected and actual results",
        "Include any error messages"
      ],
      isOpen: true
    },
    {
      id: 'describe',
      title: "2. Describe what you've tried",
      content: [
        "Show what you've tried and tell us what you found",
        "Explain any research you've done",
        "Describe any solutions you've attempted"
      ],
      isOpen: false
    },
    {
      id: 'code',
      title: "3. Show some code",
      content: [
        "When appropriate, share a minimal code sample",
        "Use code blocks to format your code",
        "Include relevant error messages"
      ],
      isOpen: false
    }
  ]);

  const toggleAccordion = (id: string) => {
    setAccordionSections(sections =>
      sections.map(section =>
        section.id === id ? { ...section, isOpen: !section.isOpen } : section
      )
    );
  };

  // Rich text editor functions
  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.body.substring(start, end);
    const newText = formData.body.substring(0, start) + before + selectedText + after + formData.body.substring(end);
    
    setFormData({ ...formData, body: newText });
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertBlock = (markdown: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lines = formData.body.split('\n');
    let currentLine = 0;
    let charCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      if (charCount + lines[i].length >= start) {
        currentLine = i;
        break;
      }
      charCount += lines[i].length + 1; // +1 for newline
    }

    lines.splice(currentLine, 0, markdown);
    const newText = lines.join('\n');
    setFormData({ ...formData, body: newText });
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + markdown.length + 1;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertList = (prefix: string, isNumbered: boolean = false) => {
    const editor = editorRef.current;
    if (!editor) return;

    // Use setTimeout to ensure focus happens after button click
    setTimeout(() => {
      // Focus the editor first
      editor.focus();
      
      // Ensure there's a selection - if not, create one at cursor position
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        // Create a range at the end of the editor
        const range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(false); // Collapse to end
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      
      // Use document.execCommand for lists
      try {
        if (isNumbered) {
          document.execCommand('insertOrderedList', false);
        } else {
          document.execCommand('insertUnorderedList', false);
        }
        
        // Trigger change event to update state
        editor.dispatchEvent(new Event('input', { bubbles: true }));
      } catch (error) {
        console.error('Error inserting list:', error);
        // Fallback: insert markdown-style list
        const currentSelection = window.getSelection();
        if (currentSelection && currentSelection.rangeCount > 0) {
          const range = currentSelection.getRangeAt(0);
          const listItem = isNumbered ? '1. ' : '* ';
          const textNode = document.createTextNode(listItem);
          range.insertNode(textNode);
          range.setStartAfter(textNode);
          range.collapse(true);
          currentSelection.removeAllRanges();
          currentSelection.addRange(range);
          editor.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    }, 10);
  };

  const handleFormat = (type: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    // Focus the editor
    editor.focus();
    
    // Use document.execCommand for visual formatting
    switch (type) {
      case 'bold':
        document.execCommand('bold', false);
        break;
      case 'italic':
        document.execCommand('italic', false);
        break;
      case 'strikethrough':
        document.execCommand('strikeThrough', false);
        break;
      case 'code':
        insertText('`', '`');
        break;
      case 'codeblock':
        insertText('```\n', '\n```');
        break;
      case 'link':
        const url = prompt('Enter URL:');
        if (url) {
          const text = textareaRef.current?.selectionStart !== textareaRef.current?.selectionEnd
            ? formData.body.substring(textareaRef.current!.selectionStart, textareaRef.current!.selectionEnd)
            : 'link text';
          insertText(`[${text}](${url})`, '');
        }
        break;
      case 'image':
        setShowImageModal(true);
        setImageFile(null);
        setImagePreview(null);
        setImageError('');
        break;
      case 'blockquote':
        insertBlock('> ');
        break;
      case 'heading':
        insertText('# ', '');
        break;
      case 'list':
        insertList('* ');
        break;
      case 'numbered-list':
        insertList('1. ', true);
        break;
      case 'hr':
        insertBlock('---');
        break;
      default:
        break;
    }
  };

  // Image upload handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetImage(file);
    }
  };

  const validateAndSetImage = (file: File) => {
    setImageError('');
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setImageError('Only JPEG, PNG, and GIF images are supported.');
      return;
    }

    // Check file size (2 MiB = 2 * 1024 * 1024 bytes)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setImageError('Image size must be less than 2 MiB.');
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      validateAndSetImage(file);
    } else {
      setImageError('Please drop an image file.');
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          validateAndSetImage(file);
          e.preventDefault();
          break;
        }
      }
    }
  };

  const handleAddImage = async () => {
    if (!imageFile || !imagePreview) {
      setImageError('Please select an image first.');
      return;
    }

    // Generate a unique ID for this image
    const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store the image data in state
    setImageDataMap(prev => ({
      ...prev,
      [imageId]: imagePreview
    }));
    
    // Insert just the link text with the ID - no long base64 in textarea
    insertText(`[your image](IMAGE:${imageId})`, '');
    
    // Close modal and reset
    setShowImageModal(false);
    setImageFile(null);
    setImagePreview(null);
    setImageError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancelImage = () => {
    setShowImageModal(false);
    setImageFile(null);
    setImagePreview(null);
    setImageError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditorChange = () => {
    const editor = editorRef.current;
    if (!editor) return;
    
    // Get plain text content for validation
    const text = editor.innerText || editor.textContent || '';
    setFormData(prev => ({ ...prev, body: text }));
    setBodyLength(text.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Let Enter key work normally - list continuation will be handled by the browser
    // We'll convert HTML to markdown on submit
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate inputs
      if (formData.title.length < 15) {
        setError('Title must be at least 15 characters');
        setLoading(false);
        return;
      }

      const editor = editorRef.current;
      if (!editor) {
        setError('Editor not found');
        setLoading(false);
        return;
      }

      // Convert HTML content to markdown
      const htmlToMarkdown = (html: string): string => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        const processNode = (node: Node): string => {
          if (node.nodeType === Node.TEXT_NODE) {
            return node.textContent || '';
          }
          
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            const tagName = el.tagName.toLowerCase();
            const children = Array.from(node.childNodes).map(processNode).join('');
            
            if (tagName === 'strong' || tagName === 'b') {
              return `**${children}**`;
            } else if (tagName === 'em' || tagName === 'i') {
              return `*${children}*`;
            } else if (tagName === 's' || tagName === 'strike' || tagName === 'del') {
              return `~~${children}~~`;
            } else if (tagName === 'code') {
              return `\`${children}\``;
            } else if (tagName === 'h1') {
              return `# ${children}\n`;
            } else if (tagName === 'h2') {
              return `## ${children}\n`;
            } else if (tagName === 'h3') {
              return `### ${children}\n`;
            } else if (tagName === 'p') {
              return children + '\n';
            } else if (tagName === 'br') {
              return '\n';
            } else if (tagName === 'div') {
              return children;
            }
            return children;
          }
          
          return '';
        };
        
        return Array.from(tempDiv.childNodes).map(processNode).join('').trim();
      };

      const markdownBody = htmlToMarkdown(editor.innerHTML);
      
      if (markdownBody.length < 50) {
        setError('Details must be at least 50 characters');
        setLoading(false);
        return;
      }

      const tags = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      if (tags.length === 0) {
        setError('Please add at least one tag');
        setLoading(false);
        return;
      }

      // Replace image placeholders with actual base64 data before sending
      let processedBody = markdownBody;
      Object.keys(imageDataMap).forEach(imageId => {
        processedBody = processedBody.replace(
          new RegExp(`\\[your image\\]\\(IMAGE:${imageId}\\)`, 'g'),
          `[your image](${imageDataMap[imageId]})`
        );
      });

      console.log('Creating question with:', { title: formData.title, body: processedBody, tags });

      const response = await api.post('/questions', {
        title: formData.title,
        body: processedBody,
        tags,
      });

      console.log('Question created:', response.data);

      // Redirect to the new question
      router.push(`/questions/${response.data._id}`);
    } catch (err: any) {
      console.error('Error creating question:', err);
      setError(err.response?.data?.error || err.message || 'Failed to create question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Image Upload Modal */}
      {showImageModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCancelImage();
            }
          }}
        >
          <div 
            className="bg-slate-800 border-2 border-slate-700 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onPaste={handlePaste}
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
          >
            <div className="p-6">
              {/* Warning Box */}
              <div className="bg-amber-900/30 border border-amber-700/50 rounded p-4 mb-4">
                <p className="text-sm text-white">
                  Images are useful in a post, but <strong>make sure the post is still clear without them</strong>. If you post images of code or error messages, copy and paste or type the actual code or message into the post directly.
                </p>
              </div>

              {/* Upload Area */}
              <div className="mb-4">
                <p className="text-white mb-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-cyan-400 hover:text-cyan-300 underline"
                  >
                    Browse
                  </button>
                  , drag & drop, or paste an image.
                </p>
                <p className="text-sm text-slate-400 mb-4">
                  Supported file types: jpeg, png, gif (Max size 2 MiB)
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Drop Zone */}
                <div
                  className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-cyan-500/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-h-64 mx-auto rounded"
                      />
                      <p className="text-sm text-slate-400">{imageFile?.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <svg className="w-12 h-12 mx-auto text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-slate-400">Click to browse or drag and drop an image here</p>
                    </div>
                  )}
                </div>

                {imageError && (
                  <p className="text-red-400 text-sm mt-2">{imageError}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleAddImage}
                    disabled={!imageFile}
                    className="text-cyan-400 hover:text-cyan-300 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
                  >
                    Add image
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelImage}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  User contributions licensed under CC BY-SA (content policy)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-slate-900">
      <Sidebar />
      <main className="main-with-sidebar !pl-[20rem] lg:!pl-[22rem] xl:!pl-[24rem]">
      <div className="max-w-[1400px] mx-auto px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 py-12 sm:py-16 md:py-20">
        <div className="mb-10 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">Ask question</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-10 sm:gap-12 md:gap-16">
          {/* Main Form Area - 70% */}
          <div className="lg:col-span-7">
            {error && (
              <div className="bg-red-500/20 text-red-400 p-6 rounded-lg mb-6 border-2 border-red-500/50 text-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-10 sm:space-y-12">
              {/* Title */}
              <div>
                <label className="block text-xl sm:text-2xl font-bold text-white mb-3">
                  Title<span className="text-red-400 ml-2">*</span>
                </label>
                <p className="text-base sm:text-lg text-slate-400 mb-4">
                  Be specific and imagine you're asking a question to another person. Min 15 characters.
                </p>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-6 py-4 text-lg sm:text-xl bg-slate-800 border-2 border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  required
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-xl sm:text-2xl font-bold text-white mb-3">
                  Body<span className="text-red-400 ml-2">*</span>
                </label>
                <p className="text-base sm:text-lg text-slate-400 mb-4">
                  Include all the information someone would need to answer your question. Min 50 characters.
                </p>
                {/* Rich Text Editor Toolbar */}
                <div className="flex items-center gap-2 mb-3 p-4 bg-slate-800 border-2 border-slate-600 rounded-t-lg">
                  <select 
                    className="bg-slate-700 text-white text-base px-4 py-2 rounded-lg border-2 border-slate-600 cursor-pointer"
                    onChange={(e) => {
                      handleFormat(e.target.value);
                      e.target.value = 'normal';
                    }}
                  >
                    <option value="normal">Normal</option>
                    <option value="heading">Heading</option>
                  </select>
                  <button 
                    type="button" 
                    onClick={() => handleFormat('bold')}
                    className="p-3 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                    title="Bold"
                  >
                    <span className="font-bold text-lg">B</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleFormat('italic')}
                    className="p-3 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                    title="Italic"
                  >
                    <span className="italic text-lg">I</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleFormat('strikethrough')}
                    className="p-3 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                    title="Strikethrough"
                  >
                    <span className="text-lg">/</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleFormat('strikethrough')}
                    className="p-3 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                    title="Section"
                  >
                    <span className="text-lg">§</span>
                  </button>
                  <div className="w-px h-8 bg-slate-600"></div>
                  <button 
                    type="button" 
                    onClick={() => handleFormat('code')}
                    className="p-3 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                    title="Inline code"
                  >
                    <span className="text-base">&lt;&gt;</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleFormat('image')}
                    className="p-3 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                    title="Insert image"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleFormat('link')}
                    className="p-3 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                    title="Insert link"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleFormat('blockquote')}
                    className="p-3 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                    title="Blockquote"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleFormat('heading')}
                    className="p-3 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                    title="Heading"
                  >
                    <span className="text-base font-bold">#</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={(e) => {
                      e.preventDefault();
                      handleFormat('numbered-list');
                    }}
                    className="p-3 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                    title="Numbered list"
                  >
                    <MdFormatListNumbered className="w-5 h-5" />
                  </button>
                  <button 
                    type="button" 
                    onClick={(e) => {
                      e.preventDefault();
                      handleFormat('list');
                    }}
                    className="p-3 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                    title="Bullet list"
                  >
                    <MdFormatListBulleted className="w-5 h-5" />
                  </button>
                  <div className="w-px h-8 bg-slate-600"></div>
                  <button 
                    type="button" 
                    onClick={() => handleFormat('hr')}
                    className="p-3 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                    title="Horizontal rule"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleFormat('codeblock')}
                    className="p-3 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                    title="Code block"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </button>
                </div>
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={handleEditorChange}
                  onKeyDown={handleKeyDown}
                  suppressContentEditableWarning
                  className="w-full min-h-[500px] sm:min-h-[600px] px-6 py-4 bg-slate-800 border-2 border-slate-600 border-t-0 rounded-b-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-y text-lg sm:text-xl"
                  style={{ whiteSpace: 'pre-wrap' }}
                  data-placeholder="Include all the information someone would need to answer your question..."
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xl sm:text-2xl font-bold text-white mb-3">
                  Tags<span className="text-red-400 ml-2">*</span>
                </label>
                <p className="text-base sm:text-lg text-slate-400 mb-4">
                  Add up to 5 tags to describe what your question is about. Start typing to see suggestions.
                </p>
                <div className="relative">
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="e.g. (postgresql xml javascript)"
                    className="w-full px-6 py-4 pl-12 text-lg sm:text-xl bg-slate-800 border-2 border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    required
                  />
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Select where to post */}
              <div>
                <label className="block text-xl sm:text-2xl font-bold text-white mb-3">
                  Select where your question should be posted.<span className="text-red-400 ml-2">*</span>
                </label>
                <select className="w-full px-6 py-4 text-lg sm:text-xl bg-slate-800 border-2 border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
                  <option>Stack Overflow (External API)</option>
                </select>
              </div>

              {/* Submit */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading || formData.title.length < 15 || bodyLength < 50 || formData.tags.split(',').filter(t => t.trim().length > 0).length === 0}
                  className="bg-cyan-500 text-white font-bold py-4 px-8 text-lg sm:text-xl rounded-lg hover:bg-cyan-400 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
                >
                  {loading ? 'Posting...' : 'Post your question'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Sidebar - 30% */}
          <div className="lg:col-span-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Draft your question</h2>
              <p className="text-base sm:text-lg text-slate-400 mb-6">
                The community is here to help you with specific coding, algorithm, or language problems.
              </p>

              {/* Accordion Sections */}
              <div className="space-y-0">
                {accordionSections.map((section) => (
                  <div key={section.id} className="border-b-2 border-slate-700">
                    <button
                      type="button"
                      onClick={() => toggleAccordion(section.id)}
                      className="w-full flex items-center justify-between py-4 text-left"
                    >
                      <span className={`text-lg sm:text-xl font-semibold ${section.isOpen ? 'text-cyan-400' : 'text-slate-400'}`}>
                        {section.title}
                      </span>
                      <svg
                        className={`w-6 h-6 text-slate-400 transition-transform ${section.isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {section.isOpen && (
                      <div className="pb-4 space-y-3">
                        {section.content.map((item, index) => (
                          <div key={index} className="flex items-start gap-3 text-base sm:text-lg text-slate-300">
                            <span className="text-slate-500 mt-1">•</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Helpful links */}
              <div className="mt-6 pt-6 border-t-2 border-slate-700">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Helpful links</h3>
                <div className="space-y-2">
                  <a href="#" className="block text-base sm:text-lg text-cyan-400 hover:text-cyan-300">
                    how to ask a good question here
                  </a>
                  <a href="#" className="block text-base sm:text-lg text-cyan-400 hover:text-cyan-300">
                    help center
                  </a>
                  <a href="#" className="block text-base sm:text-lg text-cyan-400 hover:text-cyan-300">
                    meta
                  </a>
                </div>
              </div>

              {/* Help us improve */}
              <div className="mt-6 pt-6 border-t-2 border-slate-700">
                <div className="bg-slate-800/50 border-2 border-slate-700 rounded-lg p-4">
                  <p className="text-sm sm:text-base text-slate-400">
                    Help us improve how to ask a question by{' '}
                    <a href="#" className="text-cyan-400 hover:text-cyan-300">
                      providing feedback or reporting a bug
                    </a>
                    <svg className="inline w-4 h-4 ml-1 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </main>
    </div>
    </>
  );
}