import { Share2 } from 'lucide-react';
import { showToast } from '../utils/toast';

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
}

export const ShareButton = ({ url, title, description, className = '' }: ShareButtonProps) => {
  const handleShare = async () => {
    const shareData = {
      title,
      text: description || title,
      url,
    };

    // Check if Web Share API is supported (mobile devices)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== 'AbortError') {
          fallbackShare(url, title);
        }
      }
    } else {
      // Fallback for desktop
      fallbackShare(url, title);
    }
  };

  const fallbackShare = (url: string, title: string) => {
    // Copy to clipboard
    navigator.clipboard.writeText(url).then(() => {
      showToast.success('Link copied to clipboard!');
    }).catch(() => {
      // If clipboard fails, show share options
      showShareOptions(url, title);
    });
  };

  const showShareOptions = (url: string, title: string) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    const shareOptions = [
      {
        name: 'WhatsApp',
        url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
        color: 'bg-green-500',
      },
      {
        name: 'Facebook',
        url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        color: 'bg-blue-600',
      },
      {
        name: 'Twitter',
        url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        color: 'bg-blue-400',
      },
      {
        name: 'Copy Link',
        url: null,
        color: 'bg-gray-600',
      },
    ];

    // Create modal with share options
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-xl p-6 max-w-sm w-full">
        <h3 class="text-lg font-bold mb-4">Share this listing</h3>
        <div class="space-y-2">
          ${shareOptions.map(option => `
            <button
              onclick="${option.url ? `window.open('${option.url}', '_blank')` : `navigator.clipboard.writeText('${url}'); alert('Link copied!')`}"
              class="${option.color} text-white px-4 py-3 rounded-lg w-full hover:opacity-90 transition-opacity"
            >
              ${option.name}
            </button>
          `).join('')}
        </div>
        <button
          onclick="this.closest('.fixed').remove()"
          class="mt-4 w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    `;
    
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };
    
    document.body.appendChild(modal);
  };

  return (
    <button
      onClick={handleShare}
      className={`flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors ${className}`}
      title="Share this listing"
    >
      <Share2 className="w-4 h-4" />
      <span>Share</span>
    </button>
  );
};
