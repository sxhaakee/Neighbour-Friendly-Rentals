import toast from 'react-hot-toast';

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      style: {
        border: '1px solid #10b981',
      },
    });
  },
  
  error: (message: string) => {
    toast.error(message, {
      style: {
        border: '1px solid #ef4444',
      },
    });
  },
  
  loading: (message: string) => {
    return toast.loading(message);
  },
  
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, messages);
  },
  
  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },
};
