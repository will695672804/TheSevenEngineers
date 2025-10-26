import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Clock, Star, BookOpen, CheckCircle, ShoppingCart } from 'lucide-react';
import { useCourses } from '../contexts/CoursesContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { courses, enrollInCourse, markLessonComplete, fetchCourseById } = useCourses();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'reviews'>('overview');
  const toast = useToast();
  const navigate = useNavigate();

  type Course = (typeof courses)[number] | null;
  type TabId = 'overview' | 'curriculum' | 'reviews';

  const [localCourse, setLocalCourse] = useState<Course>(() => courses.find(c => c.id === id) ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!id) {
        setError('ID de formation manquant');
        return;
      }

      const fromCtx = courses.find(c => c.id === id);
      if (fromCtx) {
        setLocalCourse(fromCtx);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const fetched = await fetchCourseById(id);
        if (!mounted) return;
        if (!fetched) {
          setError('Formation non trouvée');
        } else {
          setLocalCourse(fetched as Course);
        }
      } catch (err) {
        setError('Erreur lors du chargement de la formation');
        console.error('Error fetching course detail:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [id, courses, fetchCourseById]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Chargement de la formation...</div>
      </div>
    );
  }

  if (error || !localCourse) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{error ?? 'Formation non trouvée'}</h2>
          <Link to="/courses" className="text-blue-600 hover:text-blue-700">
            ← Retour aux formations
          </Link>
        </div>
      </div>
    );
  }

  const handleEnroll = async () => {
    try {
      if (user) {
        await enrollInCourse(localCourse.id);
        toast.showToast('Inscription réussie', {
          label: 'Aller au cours',
          onClick: () => navigate(`/dashboard?tab=courses&courseId=${encodeURIComponent(localCourse.id)}`),
        });
        navigate(`/dashboard?tab=courses&courseId=${encodeURIComponent(localCourse.id)}`);
      } else {
        await addToCart(localCourse.id, 'course', 1);
        navigate('/cart');
      }
    } catch (error: unknown) {
      console.error('Enrollment/Add to cart failed:', error);
      const errMsg = ((error as { message?: string })?.message ?? '').toString();

      // If backend responded that user is already enrolled (HTTP 409), treat as success
      const lower = errMsg.toLowerCase();
  if (lower.includes("d'eja") || lower.includes('déjà') || lower.includes('dej') || lower.includes('already enrolled')) {
        // show the same success flow
        toast.showToast('Inscription (déjà effectuée)', {
          label: 'Aller au cours',
          onClick: () => navigate(`/dashboard?tab=courses&courseId=${encodeURIComponent(localCourse.id)}`),
        });
        navigate(`/dashboard?tab=courses&courseId=${encodeURIComponent(localCourse.id)}`);
        return;
      }

      const finalMsg = errMsg || 'Échec de l\'inscription';
      alert(finalMsg);
    }
  };

  const handleLessonComplete = (lessonId: string) => {
    if (!localCourse) return;
    markLessonComplete(localCourse.id, lessonId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/courses" className="inline-flex items-center text-gray-300 hover:text-white mb-6">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour aux formations
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-4">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {localCourse.category}
                </span>
              </div>
              <h1 className="text-4xl font-bold mb-4">{localCourse.title}</h1>
              <p className="text-xl text-gray-300 mb-6">{localCourse.description}</p>
              
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                  <span className="font-medium">{localCourse.rating}</span>
                  <span className="text-gray-300 ml-1">({localCourse.studentsCount} étudiants)</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-1" />
                  <span>{localCourse.duration}</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-1" />
                  <span>{localCourse.lessons.length} leçons</span>
                </div>
                <div>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                    {localCourse.level}
                  </span>
                </div>
              </div>
              
              <div className="mt-6">
                <p className="text-gray-300">Instructeur: <span className="text-white font-medium">{localCourse.instructor}</span></p>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="relative mb-6">
                  <img
                    src={localCourse.image}
                    alt={localCourse.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center">
                    <Play className="h-16 w-16 text-white" />
                  </div>
                </div>
                
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900 mb-2">{localCourse.price}€</div>
                  {localCourse.isEnrolled ? (
                    <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium">
                      ✓ Inscrit - Progression: {localCourse.progress || 0}%
                    </div>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      {user ? 'S\'inscrire maintenant' : 'Ajouter au panier'}
                    </button>
                  )}
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Accès à vie</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Certificat de fin de formation</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Support 24/7</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Garantie 30 jours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8">
              <nav className="flex space-x-8">
                {[
                  { id: 'overview', label: 'Aperçu' },
                  { id: 'curriculum', label: 'Programme' },
                  { id: 'reviews', label: 'Avis' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabId)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="prose max-w-none">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">À propos de cette formation</h3>
                <p className="text-gray-600 mb-6">{localCourse.description}</p>
                
                <h4 className="text-xl font-bold text-gray-900 mb-4">Ce que vous apprendrez</h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Maîtriser les concepts fondamentaux</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Développer des projets pratiques</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Acquérir une expertise professionnelle</span>
                  </li>
                </ul>
              </div>
            )}

            {activeTab === 'curriculum' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Programme du cours</h3>
                <div className="space-y-4">
                  {localCourse.lessons.map((lesson, index) => (
                    <div key={lesson.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {lesson.isCompleted ? (
                              <CheckCircle className="h-6 w-6 text-green-500" />
                            ) : (
                              <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-500">{index + 1}</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                            <p className="text-sm text-gray-500">{lesson.duration}</p>
                          </div>
                        </div>
                        {localCourse.isEnrolled && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleLessonComplete(lesson.id)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              <Play className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Avis des étudiants</h3>
                <div className="space-y-6">
                  {[1, 2, 3].map(review => (
                    <div key={review} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-gray-900">Étudiant {review}</h4>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-600">
                            Excellente formation ! Les explications sont claires et les exercices pratiques très utiles.
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-lg sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Formations similaires</h3>
              <div className="space-y-4">
                {courses.filter(c => c.id !== localCourse.id && c.category === localCourse.category).slice(0, 3).map(similarCourse => (
                  <Link
                    key={similarCourse.id}
                    to={`/course/${similarCourse.id}`}
                    className="block hover:bg-gray-50 p-3 rounded-lg transition-colors"
                  >
                    <div className="flex space-x-3">
                      <img
                        src={similarCourse.image}
                        alt={similarCourse.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-2">{similarCourse.title}</h4>
                        <div className="flex items-center mt-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-500 ml-1">{similarCourse.rating}</span>
                        </div>
                        <p className="text-sm font-medium text-blue-600 mt-1">{similarCourse.price}€</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;