export const getStyles = (size: number, hasError: boolean, disabled: boolean) => {
  const sizeClass = size <= 80 ? 'w-20 h-20' : size <= 100 ? 'w-24 h-24' : 'w-32 h-32';
  
  return {
    container: `${sizeClass} rounded-full overflow-hidden bg-gray-100 ${
      hasError ? 'border-2 border-red-500' : 'border-2 border-gray-200'
    } ${disabled ? 'opacity-50' : ''}`,
    
    image: 'w-full h-full',
    
    placeholder: 'w-full h-full items-center justify-center',
    
    editButton: 'absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 shadow-lg',
  };
};