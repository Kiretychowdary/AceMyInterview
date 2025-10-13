// This utility function will be used to replace gradients in components
export const replaceGradients = (content) => {
  return content
    // Background gradients
    .replace(/bg-gradient-to-br from-blue-50 to-purple-50/g, 'bg-blue-50')
    .replace(/bg-gradient-to-br from-blue-\d+ to-purple-\d+/g, 'bg-blue-600')
    
    // Button gradients - blue to purple
    .replace(/bg-gradient-to-r from-blue-(\d+) to-purple-(\d+) text-white rounded-xl hover:from-blue-(\d+) hover:to-purple-(\d+)/g, 
             'bg-blue-$1 hover:bg-blue-$3 text-white rounded-xl')
    
    // Button gradients - green to blue  
    .replace(/bg-gradient-to-r from-green-(\d+) to-blue-(\d+) text-white rounded-xl hover:from-green-(\d+) hover:to-blue-(\d+)/g,
             'bg-green-$1 hover:bg-green-$3 text-white rounded-xl')
             
    // Icon gradients
    .replace(/bg-gradient-to-r from-green-(\d+) to-blue-(\d+)/g, 'bg-blue-$2')
    
    // General gradient replacements
    .replace(/from-blue-(\d+) to-purple-(\d+)/g, 'bg-blue-$1')
    .replace(/from-green-(\d+) to-blue-(\d+)/g, 'bg-blue-$2')
    .replace(/bg-gradient-to-[a-z]+ /g, 'bg-blue-600 ');
};

export default replaceGradients;