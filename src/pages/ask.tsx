import { useState, useRef, useEffect } from 'react';
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
  const [user, setUser] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (!userData || !token) {
        router.push('/login?redirect=/ask');
        return;
      }

      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error('Failed to parse user data:', err);
        router.push('/login?redirect=/ask');
        return;
      }
    }
    setIsAuthChecking(false);
  }, [router]);

  const toggleAccordion = (id: string) => {
    setAccordionSections(sections =>
      sections.map(section =>
        section.id === id ? { ...section, isOpen: !section.isOpen } : section
      )
    );
  };

  const insertTextAtCursor = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.body.substring(start, end);
    const newText = formData.body.substring(0, start) + before + selectedText + after + formData.body.substring(end);
    
    setFormData({ ...formData, body: newText });
    setBodyLength(newText.length);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertBlockAtCursor = (markdown: string) => {
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
      charCount += lines[i].length + 1;
    }

    lines.splice(currentLine, 0, markdown);
    const newText = lines.join('\n');
    setFormData({ ...formData, body: newText });
    setBodyLength(newText.length);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + markdown.length + 1;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleFormat = (type: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.focus();
    
    switch (type) {
      case 'bold':
        insertTextAtCursor('**', '**');
        break;
      case 'italic':
        insertTextAtCursor('*', '*');
        break;
      case 'strikethrough':
        insertTextAtCursor('~~', '~~');
        break;
      case 'code':
        insertTextAtCursor('`', '`');
        break;
      case 'codeblock':
        const codeBlock = '```\n// Your code here\n```';
        insertTextAtCursor(codeBlock + '\n\n', '');
        setTimeout(() => {
          const start = textarea.selectionStart - codeBlock.length - 2;
          const end = start + '// Your code here'.length;
          textarea.setSelectionRange(start, end);
        }, 10);
        break;
      case 'link':
        const url = prompt('Enter URL:');
        if (url) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const selectedText = formData.body.substring(start, end) || 'link text';
          insertTextAtCursor(`[${selectedText}](${url})`, '');
        }
        break;
      case 'image':
        setShowImageModal(true);
        setImageFile(null);
        setImagePreview(null);
        setImageError('');
        break;
      case 'blockquote':
        insertBlockAtCursor('> ');
        break;
      case 'heading':
        insertTextAtCursor('# ', '');
        break;
      case 'list':
        insertBlockAtCursor('- ');
        break;
      case 'numbered-list':
        insertBlockAtCursor('1. ');
        break;
      case 'hr':
        insertBlockAtCursor('---\n');
        break;
      default:
        break;
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetImage(file);
    }
  };

  const compressImage = (file: File, maxWidth: number = 1200, maxHeight: number = 1200, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            } else {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }
          
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Image compression failed'));
                return;
              }
              
              if (blob.size > 500 * 1024) {
                canvas.toBlob(
                  (smallerBlob) => {
                    if (!smallerBlob) {
                      reject(new Error('Image compression failed'));
                      return;
                    }
                    const reader2 = new FileReader();
                    reader2.onloadend = () => resolve(reader2.result as string);
                    reader2.onerror = () => reject(new Error('Failed to read compressed image'));
                    reader2.readAsDataURL(smallerBlob);
                  },
                  file.type,
                  0.5
                );
              } else {
                const reader2 = new FileReader();
                reader2.onloadend = () => resolve(reader2.result as string);
                reader2.onerror = () => reject(new Error('Failed to read compressed image'));
                reader2.readAsDataURL(blob);
              }
            },
            file.type,
            quality
          );
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const validateAndSetImage = async (file: File) => {
    setImageError('');
    
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setImageError('Only JPEG, PNG, and GIF images are supported.');
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setImageError('Image size must be less than 2 MiB.');
      return;
    }

    setImageFile(file);
    
    try {
      const compressedDataUrl = await compressImage(file);
      setImagePreview(compressedDataUrl);
    } catch (error) {
      console.error('Error compressing image:', error);
      setImageError('Failed to process image. Please try another image.');
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await validateAndSetImage(file);
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
          await validateAndSetImage(file);
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

    const textarea = textareaRef.current;
    if (!textarea) {
      setImageError('Editor not found.');
      return;
    }

    const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    setImageDataMap(prev => ({
      ...prev,
      [imageId]: imagePreview
    }));
    
    const imageMarkdown = `[your image](IMAGE:${imageId})\n\n`;
    insertTextAtCursor(imageMarkdown, '');
    
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
    const value = e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
    
    if (e.target.name === 'body') {
      setBodyLength(value.length);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (formData.title.length < 15) {
        setError('Title must be at least 15 characters');
        setLoading(false);
        return;
      }

      const markdownBody = formData.body.trim();
      
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

      let processedBody = markdownBody;
      Object.keys(imageDataMap).forEach(imageId => {
        processedBody = processedBody.replace(
          new RegExp(`\\[your image\\]\\(IMAGE:${imageId}\\)`, 'g'),
          `[your image](${imageDataMap[imageId]})`
        );
      });

      const response = await api.post('/questions', {
        title: formData.title,
        body: processedBody,
        tags,
      });

      router.push(`/questions/${response.data._id}`);
    } catch (err: any) {
      console.error('Error creating question:', err);
      setError(err.response?.data?.error || err.message || 'Failed to create question');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthChecking) {
    return (
      <div className="ask-loading-container">
        <div className="ask-loading-content">
          <div className="ask-loading-text">Checking authentication...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="ask-loading-container">
        <div className="ask-loading-content">
          <div className="ask-loading-text">You must be logged in to ask a question</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Image Upload Modal */}
      {showImageModal && (
        <div 
          className="ask-image-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCancelImage();
            }
          }}
        >
          <div 
            className="ask-image-modal-container"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onPaste={handlePaste}
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
          >
            <div className="ask-image-modal-content">
              {/* Warning Box */}
              <div className="ask-image-warning-box">
                <p className="ask-image-warning-text">
                  Images are useful in a post, but <strong>make sure the post is still clear without them</strong>. If you post images of code or error messages, copy and paste or type the actual code or message into the post directly.
                </p>
              </div>

              {/* Upload Area */}
              <div className="ask-image-upload-section">
                <p className="ask-image-upload-text">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="ask-image-browse-link"
                  >
                    Browse
                  </button>
                  , drag & drop, or paste an image.
                </p>
                <p className="ask-image-upload-hint">
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
                  className="ask-image-drop-zone"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {imagePreview ? (
                    <div className="ask-image-preview-container">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="ask-image-preview"
                      />
                      <p className="ask-image-file-name">{imageFile?.name}</p>
                    </div>
                  ) : (
                    <div className="ask-image-empty-state">
                      <svg className="ask-image-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="ask-image-empty-text">Click to browse or drag and drop an image here</p>
                    </div>
                  )}
                </div>

                {imageError && (
                  <p className="ask-image-error">{imageError}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="ask-image-modal-actions">
                <div className="ask-image-modal-buttons">
                  <button
                    type="button"
                    onClick={handleAddImage}
                    disabled={!imageFile}
                    className="ask-image-modal-button"
                  >
                    Add image
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelImage}
                    className="ask-image-modal-button"
                  >
                    Cancel
                  </button>
                </div>
                <p className="ask-image-modal-footer">
                  User contributions licensed under CC BY-SA (content policy)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="ask-page-container">
        <Sidebar />
        <main className="main-with-sidebar !pl-[20rem] lg:!pl-[22rem] xl:!pl-[24rem]">
          <div className="ask-main-container">
            <div className="ask-page-title-container">
              <h1 className="ask-page-title">Ask question</h1>
            </div>

            <div className="ask-grid-container">
              {/* Main Form Area */}
              <div className="ask-form-section">
                {error && (
                  <div className="ask-error-message">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="ask-form">
                  {/* Title */}
                  <div className="ask-field-group">
                    <label className="ask-label">
                      Title<span className="ask-label-required">*</span>
                    </label>
                    <p className="ask-field-description">
                      Be specific and imagine you're asking a question to another person. Min 15 characters.
                    </p>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="ask-input"
                      required
                    />
                  </div>

                  {/* Body */}
                  <div className="ask-field-group">
                    <label className="ask-label">
                      Body<span className="ask-label-required">*</span>
                    </label>
                    <p className="ask-field-description">
                      Include all the information someone would need to answer your question. Min 50 characters.
                    </p>
                    {/* Rich Text Editor Toolbar */}
                    <div className="ask-toolbar">
                      <select 
                        className="ask-toolbar-select"
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
                        className="ask-toolbar-button"
                        title="Bold"
                      >
                        <span className="ask-toolbar-button-text font-bold">B</span>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleFormat('italic')}
                        className="ask-toolbar-button"
                        title="Italic"
                      >
                        <span className="ask-toolbar-button-text italic">I</span>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleFormat('strikethrough')}
                        className="ask-toolbar-button"
                        title="Strikethrough"
                      >
                        <span className="ask-toolbar-button-text">/</span>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleFormat('strikethrough')}
                        className="ask-toolbar-button"
                        title="Section"
                      >
                        <span className="ask-toolbar-button-text">§</span>
                      </button>
                      <div className="ask-toolbar-separator"></div>
                      <button 
                        type="button" 
                        onClick={() => handleFormat('code')}
                        className="ask-toolbar-button"
                        title="Inline code"
                      >
                        <span className="ask-toolbar-button-text">&lt;&gt;</span>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleFormat('image')}
                        className="ask-toolbar-button"
                        title="Insert image"
                      >
                        <svg className="ask-toolbar-button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleFormat('link')}
                        className="ask-toolbar-button"
                        title="Insert link"
                      >
                        <svg className="ask-toolbar-button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleFormat('blockquote')}
                        className="ask-toolbar-button"
                        title="Blockquote"
                      >
                        <svg className="ask-toolbar-button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleFormat('heading')}
                        className="ask-toolbar-button"
                        title="Heading"
                      >
                        <span className="ask-toolbar-button-text font-bold">#</span>
                      </button>
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.preventDefault();
                          handleFormat('numbered-list');
                        }}
                        className="ask-toolbar-button"
                        title="Numbered list"
                      >
                        <MdFormatListNumbered className="ask-toolbar-button-icon" />
                      </button>
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.preventDefault();
                          handleFormat('list');
                        }}
                        className="ask-toolbar-button"
                        title="Bullet list"
                      >
                        <MdFormatListBulleted className="ask-toolbar-button-icon" />
                      </button>
                      <div className="ask-toolbar-separator"></div>
                      <button 
                        type="button" 
                        onClick={() => handleFormat('hr')}
                        className="ask-toolbar-button"
                        title="Horizontal rule"
                      >
                        <svg className="ask-toolbar-button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleFormat('codeblock')}
                        className="ask-toolbar-button"
                        title="Code block"
                      >
                        <svg className="ask-toolbar-button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                      </button>
                    </div>
                    <textarea
                      ref={textareaRef}
                      name="body"
                      value={formData.body}
                      onChange={handleChange}
                      placeholder="Include all the information someone would need to answer your question..."
                      className="ask-textarea"
                      style={{ whiteSpace: 'pre-wrap' }}
                      required
                    />
                  </div>

                  {/* Tags */}
                  <div className="ask-field-group">
                    <label className="ask-label">
                      Tags<span className="ask-label-required">*</span>
                    </label>
                    <p className="ask-field-description">
                      Add up to 5 tags to describe what your question is about. Start typing to see suggestions.
                    </p>
                    <div className="ask-tags-wrapper">
                      <input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        placeholder="e.g. (postgresql xml javascript)"
                        className="ask-tags-input"
                        required
                      />
                      <svg className="ask-tags-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>

                  {/* Select where to post */}
                  <div className="ask-field-group">
                    <label className="ask-label">
                      Select where your question should be posted.<span className="ask-label-required">*</span>
                    </label>
                    <select className="ask-select">
                      <option>Stack Overflow (External API)</option>
                    </select>
                  </div>

                  {/* Submit */}
                  <div className="ask-submit-container">
                    <button
                      type="submit"
                      disabled={loading || formData.title.length < 15 || bodyLength < 50 || formData.tags.split(',').filter(t => t.trim().length > 0).length === 0}
                      className="ask-submit-button"
                    >
                      {loading ? 'Posting...' : 'Post your question'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Sidebar */}
              <div className="ask-sidebar-section">
                <div>
                  <h2 className="ask-sidebar-title">Draft your question</h2>
                  <p className="ask-sidebar-description">
                    The community is here to help you with specific coding, algorithm, or language problems.
                  </p>

                  {/* Accordion Sections */}
                  <div className="ask-accordion-container">
                    {accordionSections.map((section) => (
                      <div key={section.id} className="ask-accordion-item">
                        <button
                          type="button"
                          onClick={() => toggleAccordion(section.id)}
                          className="ask-accordion-button"
                        >
                          <span className={`ask-accordion-title ${section.isOpen ? 'open' : ''}`}>
                            {section.title}
                          </span>
                          <svg
                            className={`ask-accordion-icon ${section.isOpen ? 'open' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {section.isOpen && (
                          <div className="ask-accordion-content">
                            {section.content.map((item, index) => (
                              <div key={index} className="ask-accordion-list-item">
                                <span className="ask-accordion-bullet">•</span>
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Helpful links */}
                  <div className="ask-links-section">
                    <h3 className="ask-links-title">Helpful links</h3>
                    <div className="ask-links-list">
                      <a href="#" className="ask-link">
                        how to ask a good question here
                      </a>
                      <a href="#" className="ask-link">
                        help center
                      </a>
                      <a href="#" className="ask-link">
                        meta
                      </a>
                    </div>
                  </div>

                  {/* Help us improve */}
                  <div className="ask-feedback-section">
                    <div className="ask-feedback-box">
                      <p className="ask-feedback-text">
                        Help us improve how to ask a question by{' '}
                        <a href="#" className="ask-feedback-link">
                          providing feedback or reporting a bug
                        </a>
                        <svg className="ask-feedback-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
