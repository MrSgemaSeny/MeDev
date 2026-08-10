import { ClassicTemplate } from '../../features/resume/templates/ClassicTemplate';
import { ModernTemplate } from '../../features/resume/templates/ModernTemplate';
import { useResumeEditorStore } from '../../entities/resume/model/resumeEditorStore';

export const ResumeBuilder = () => {
  const { sections, selectedTemplate, setTemplate, toggleSection, reorderSections } = useResumeEditorStore();

  const handleDownload = () => {
    // Basic download placeholder; will need to hook up to API
    window.alert(`Downloading PDF for template: ${selectedTemplate}`);
  };

  const moveUp = (index: number) => {
    if (index > 0) reorderSections(index, index - 1);
  };

  const moveDown = (index: number) => {
    if (index < sections.length - 1) reorderSections(index, index + 1);
  };

  return (
    <div className="flex h-full bg-gray-950">
      {/* Settings Sidebar */}
      <div className="w-80 border-r border-gray-800 p-6 flex flex-col space-y-8 overflow-y-auto">
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Templates</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setTemplate('classic')}
              className={`p-3 border rounded-md transition-colors ${
                selectedTemplate === 'classic' ? 'border-emerald-500 bg-emerald-900/20' : 'border-gray-700 hover:border-gray-500'
              }`}
            >
              <div className="h-16 bg-white rounded flex items-center justify-center text-gray-900 font-serif text-sm">
                Classic
              </div>
            </button>
            <button
              onClick={() => setTemplate('modern')}
              className={`p-3 border rounded-md transition-colors ${
                selectedTemplate === 'modern' ? 'border-emerald-500 bg-emerald-900/20' : 'border-gray-700 hover:border-gray-500'
              }`}
            >
              <div className="h-16 bg-gray-900 rounded border border-gray-700 flex items-center justify-center text-white font-sans text-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-emerald-500"></div>
                Modern
              </div>
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-4">Sections</h2>
          <div className="space-y-2">
            {sections.map((section, index) => (
              <div key={section.id} className="flex items-center justify-between bg-gray-900 p-3 rounded border border-gray-800">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={section.visible}
                    onChange={() => toggleSection(section.id)}
                    className="rounded border-gray-700 text-emerald-500 focus:ring-emerald-500 bg-gray-950"
                  />
                  <span className="text-sm font-medium text-gray-300">{section.label}</span>
                </div>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => moveUp(index)} 
                    disabled={index === 0}
                    className="p-1 text-gray-500 hover:text-white disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button 
                    onClick={() => moveDown(index)} 
                    disabled={index === sections.length - 1}
                    className="p-1 text-gray-500 hover:text-white disabled:opacity-30"
                  >
                    ↓
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-8 border-t border-gray-800">
          <button 
            onClick={handleDownload}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-md transition-colors"
          >
            Download PDF
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto bg-gray-800 p-8 flex justify-center">
        <div className="scale-75 origin-top xl:scale-90 2xl:scale-100 transition-transform">
          {selectedTemplate === 'classic' ? <ClassicTemplate /> : <ModernTemplate />}
        </div>
      </div>
    </div>
  );
};
