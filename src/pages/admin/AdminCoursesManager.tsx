import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Upload, X } from 'lucide-react';
import { useCourses, Course } from '../../contexts/CoursesContext';

const AdminCoursesManager: React.FC = () => {
  const { courses, addCourse, updateCourse, deleteCourse, loading, error } = useCourses();
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (courseData: FormData) => {
    setSubmitting(true);
    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, courseData);
      } else {
        await addCourse(courseData);
      }
      setShowModal(false);
      setEditingCourse(null);
    } catch (err: unknown) {
      console.error('Erreur lors de la soumission du formulaire:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setShowModal(true);
  };

  const handleDelete = async (courseId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      try {
        await deleteCourse(courseId);
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des formations</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
          disabled={loading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle formation
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Rechercher une formation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="h-5 w-5 mr-2" />
            Filtres
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Formation</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Instructeur</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Catégorie</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Prix</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Étudiants</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCourses.map(course => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">{course.title}</h3>
                          <p className="text-sm text-gray-500">{course.duration} • {course.level}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{course.instructor}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {course.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{course.price}€</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{course.studentsCount}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(course)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          disabled={loading}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <CourseModal
          course={editingCourse}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowModal(false);
            setEditingCourse(null);
          }}
          submitting={submitting}
        />
      )}
    </div>
  );
};

interface CourseModalProps {
  course: Course | null;
  onSubmit: (courseData: FormData) => void;
  onClose: () => void;
  submitting: boolean;
}

const CourseModal: React.FC<CourseModalProps> = ({ course, onSubmit, onClose, submitting }) => {
  const [formData, setFormData] = useState({
    title: course?.title || '',
    description: course?.description || '',
    instructor: course?.instructor || '',
    price: course?.price || 0,
    duration: course?.duration || '',
    level: course?.level || 'Débutant',
    category: course?.category || ''
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState(course?.image || '');
  const [lessons, setLessons] = useState<Array<{ 
    id?: string;
    title: string; 
    duration: string; 
    videoFile?: File | null;
    videoUrl?: string;
  }>>(() =>
    course?.lessons ? course.lessons.map(l => ({ 
      id: l.id,
      title: l.title, 
      duration: l.duration, 
      videoFile: null,
      videoUrl: l.videoUrl 
    })) : []
  );

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        description: course.description,
        instructor: course.instructor,
        price: course.price,
        duration: course.duration,
        level: course.level,
        category: course.category
      });
      setImageUrl(course.image);
      setSelectedImage(null);
      setLessons(course.lessons.map(l => ({ 
        id: l.id,
        title: l.title, 
        duration: l.duration, 
        videoFile: null,
        videoUrl: l.videoUrl 
      })));
    } else {
      setFormData({
        title: '',
        description: '',
        instructor: '',
        price: 0,
        duration: '',
        level: 'Débutant',
        category: ''
      });
      setImageUrl('');
      setSelectedImage(null);
      setLessons([]);
    }
  }, [course]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = new FormData();

    // Append basic fields
    payload.append('title', formData.title);
    payload.append('description', formData.description);
    payload.append('instructor', formData.instructor);
    payload.append('price', formData.price.toString());
    payload.append('duration', formData.duration);
    payload.append('level', formData.level);
    payload.append('category', formData.category);

    // Handle image - prioritize file over URL
    if (selectedImage) {
      payload.append('image', selectedImage);
    } else if (imageUrl) {
      // send as 'image' to match server fallback (req.body.image)
      payload.append('image', imageUrl);
    }

    // Build lessons metadata array to send as JSON (server expects req.body.lessons JSON)
    const lessonsMeta = lessons.map((lesson, index) => ({
      id: lesson.id,
      title: lesson.title,
      duration: lesson.duration,
      order_index: index + 1,
      video_url: lesson.videoUrl || null
    }));

    payload.append('lessons', JSON.stringify(lessonsMeta));

    // Append lesson video files in the same order as lessonsMeta (server reads req.files.lessonVideos)
    lessons.forEach((lesson) => {
      if (lesson.videoFile instanceof File) {
        payload.append('lessonVideos', lesson.videoFile);
      }
    });

    // Optional: include lessonsCount for debugging on server
    payload.append('lessonsCount', lessons.length.toString());

  // Log FormData keys (avoid using any for lint rules)
  const keys: string[] = [];
  for (const k of payload.keys()) keys.push(k);
  console.log('\ud83d\udd04 Submitting course data (FormData keys):', keys);
    onSubmit(payload);
  };

  const addLesson = () => setLessons(prev => [...prev, { 
    title: '', 
    duration: '', 
    videoFile: null,
    videoUrl: ''
  }]);
  
  const updateLesson = (index: number, patch: Partial<{ 
    title: string; 
    duration: string; 
    videoFile?: File | null;
    videoUrl?: string;
  }>) => {
    setLessons(prev => prev.map((l, i) => i === index ? { ...l, ...patch } : l));
  };
  
  const removeLesson = (index: number) => setLessons(prev => prev.filter((_, i) => i !== index));

  const handleImageFileChange = (file: File | null) => {
    setSelectedImage(file);
    if (file) {
      setImageUrl('');
    }
  };

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    if (url) {
      setSelectedImage(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {course ? 'Modifier la formation' : 'Nouvelle formation'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={submitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre de la formation *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={submitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructeur *
              </label>
              <input
                type="text"
                value={formData.instructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={submitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
              disabled={submitting}
            />
          </div>

          {/* Image Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Image de la formation
            </label>
            
            {/* File Upload */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">Téléverser une image</label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  id="course-image-upload"
                  accept="image/*"
                  onChange={(e) => handleImageFileChange(e.target.files ? e.target.files[0] : null)}
                  className="hidden"
                  disabled={submitting}
                />
                <label
                  htmlFor="course-image-upload"
                  className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg flex items-center space-x-2 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="h-5 w-5" />
                  <span>{selectedImage ? selectedImage.name : "Choisir une image"}</span>
                </label>
                {selectedImage && (
                  <button
                    type="button"
                    onClick={() => handleImageFileChange(null)}
                    className="text-red-600 hover:text-red-800 text-sm"
                    disabled={submitting}
                  >
                    Supprimer
                  </button>
                )}
              </div>
            </div>

            {/* URL Input */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">Ou utiliser une URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={submitting || !!selectedImage}
              />
            </div>

            {course?.image && !selectedImage && !imageUrl && (
              <div className="text-sm text-gray-500">
                Image actuelle: {course.image}
              </div>
            )}
          </div>

          {/* Lessons Editor */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">Leçons</label>
              <button 
                type="button" 
                onClick={addLesson}
                className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                disabled={submitting}
              >
                + Ajouter une leçon
              </button>
            </div>
            <div className="space-y-4">
              {lessons.map((lesson, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-4">
                      <label className="block text-xs text-gray-600 mb-1">Titre *</label>
                      <input 
                        type="text" 
                        value={lesson.title} 
                        onChange={(e) => updateLesson(idx, { title: e.target.value })}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                        required
                        disabled={submitting}
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs text-gray-600 mb-1">Durée *</label>
                      <input 
                        type="text" 
                        value={lesson.duration} 
                        onChange={(e) => updateLesson(idx, { duration: e.target.value })}
                        placeholder="ex: 30min"
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                        required
                        disabled={submitting}
                      />
                    </div>
                    <div className="md:col-span-5">
                      <label className="block text-xs text-gray-600 mb-1">Vidéo (fichier ou URL)</label>
                      <div className="space-y-2">
                        <input 
                          type="file" 
                          accept="video/*" 
                          onChange={(e) => updateLesson(idx, { 
                            videoFile: e.target.files ? e.target.files[0] : null,
                            videoUrl: '' 
                          })}
                          className="w-full text-sm disabled:opacity-50"
                          disabled={submitting}
                        />
                        <input 
                          type="url"
                          value={lesson.videoUrl || ''}
                          onChange={(e) => updateLesson(idx, { 
                            videoUrl: e.target.value,
                            videoFile: null 
                          })}
                          placeholder="URL de la vidéo"
                          className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                          disabled={submitting}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-right">
                    <button 
                      type="button" 
                      onClick={() => removeLesson(idx)}
                      className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                      disabled={submitting}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix (€) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                required
                disabled={submitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durée *
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="ex: 10h"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                required
                disabled={submitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Niveau *
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value as 'Débutant' | 'Intermédiaire' | 'Avancé' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={submitting}
              >
                <option value="Débutant">Débutant</option>
                <option value="Intermédiaire">Intermédiaire</option>
                <option value="Avancé">Avancé</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie *
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              required
              disabled={submitting}
            />
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={submitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              disabled={submitting}
            >
              {submitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{course ? 'Modifier' : 'Créer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCoursesManager;