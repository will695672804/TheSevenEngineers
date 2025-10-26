import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { apiService } from '../services/api';

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  isCompleted?: boolean;
  order_index: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  price: number;
  image: string;
  duration: string;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  category: string;
  rating: number;
  studentsCount: number;
  lessons: Lesson[];
  isEnrolled?: boolean;
  progress?: number;
}

interface CoursesContextType {
  courses: Course[];
  addCourse: (courseData: FormData) => Promise<void>;
  updateCourse: (id: string, courseData: FormData) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  enrollInCourse: (courseId: string) => Promise<any>;
  markLessonComplete: (courseId: string, lessonId: string) => Promise<void>;
  fetchCourses: () => Promise<void>;
  fetchCourseById: (id: string) => Promise<Course | undefined>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

const CoursesContext = createContext<CoursesContextType | undefined>(undefined);

export const useCourses = () => {
  const context = useContext(CoursesContext);
  if (!context) {
    throw new Error('useCourses must be used within a CoursesProvider');
  }
  return context;
};

interface CoursesProviderProps {
  children: React.ReactNode;
  // Props pour les tests
  testInitialCourses?: Course[];
  skipAutoFetch?: boolean;
}

export const CoursesProvider: React.FC<CoursesProviderProps> = ({ 
  children, 
  testInitialCourses = [],
  skipAutoFetch = false 
}) => {
  const [courses, setCourses] = useState<Course[]>(testInitialCourses);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fonction utilitaire pour gérer les erreurs
  const handleError = useCallback((error: any, defaultMessage: string) => {
    console.error(defaultMessage, error);
    const message = error?.message || error?.response?.data?.message || defaultMessage;
    setError(message);
    return message;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchCourses = useCallback(async () => {
    if (loading) return; // Éviter les appels simultanés
    
    setLoading(true);
    setError(null);
    try {
      const response: any = await apiService.getCourses();
      const mappedCourses: Course[] = (response.courses || []).map((c: any) => ({
        id: c.id?.toString() ?? '',
        title: c.title ?? '',
        description: c.description ?? '',
        instructor: c.instructor ?? '',
        price: c.price ?? 0,
        image: c.image ?? '',
        duration: c.duration ?? '',
        level: (c.level as 'Débutant' | 'Intermédiaire' | 'Avancé') ?? 'Débutant',
        category: c.category ?? '',
        rating: c.rating ?? 0,
        studentsCount: c.students_count ?? 0,
        lessons: [],
        isEnrolled: c.is_enrolled === 1,
        progress: c.progress ?? 0,
      }));
      setCourses(mappedCourses);
    } catch (error: any) {
      handleError(error, 'Erreur lors du chargement des formations');
    } finally {
      setLoading(false);
    }
  }, [loading, handleError]);

  const fetchCourseById = async (id: string): Promise<Course | undefined> => {
    if (!id) {
      setError('ID de formation invalide');
      return undefined;
    }

    setError(null);
    try {
      const response: any = await apiService.getCourse(id);
      const courseData: any = response.course;
      
      if (!courseData) {
        setError('Formation non trouvée');
        return undefined;
      }

      return {
        id: courseData.id?.toString() ?? '',
        title: courseData.title ?? '',
        description: courseData.description ?? '',
        instructor: courseData.instructor ?? '',
        price: courseData.price ?? 0,
        image: courseData.image ?? '',
        duration: courseData.duration ?? '',
        level: (courseData.level as 'Débutant' | 'Intermédiaire' | 'Avancé') ?? 'Débutant',
        category: courseData.category ?? '',
        rating: courseData.rating ?? 0,
        studentsCount: courseData.students_count ?? 0,
        lessons: (courseData.lessons || []).map((l: any) => ({
          id: l.id?.toString() ?? '',
          title: l.title ?? '',
          duration: l.duration ?? '',
          videoUrl: l.video_url ?? '',
          isCompleted: l.is_completed === 1,
          order_index: l.order_index ?? 0,
        })),
        isEnrolled: courseData.is_enrolled === 1,
        progress: courseData.progress ?? 0,
      };
    } catch (error: any) {
      handleError(error, `Erreur lors du chargement de la formation ${id}`);
      return undefined;
    }
  };

  // Effet pour le chargement initial - conditionné par skipAutoFetch
  useEffect(() => {
    if (!skipAutoFetch && testInitialCourses.length === 0) {
      fetchCourses();
    }
  }, [fetchCourses, skipAutoFetch, testInitialCourses.length]);

  // Refresh courses when user changes
  useEffect(() => {
    if (user?.id && !skipAutoFetch) {
      fetchCourses();
    }
  }, [user?.id, fetchCourses, skipAutoFetch]);

  const addCourse = async (courseData: FormData) => {
    setError(null);
    try {
      await apiService.createCourse(courseData);
      await fetchCourses();
    } catch (error: any) {
      const message = handleError(error, 'Erreur lors de la création de la formation');
      throw new Error(message);
    }
  };

  const updateCourse = async (id: string, courseData: FormData) => {
    if (!id) {
      throw new Error('ID de formation invalide');
    }

    setError(null);
    try {
      await apiService.updateCourse(id, courseData);
      await fetchCourses();
    } catch (error: any) {
      const message = handleError(error, 'Erreur lors de la mise à jour de la formation');
      throw new Error(message);
    }
  };

  const deleteCourse = async (id: string) => {
    if (!id) {
      throw new Error('ID de formation invalide');
    }

    setError(null);
    try {
      await apiService.deleteCourse(id);
      await fetchCourses();
    } catch (error: any) {
      const message = handleError(error, 'Erreur lors de la suppression de la formation');
      throw new Error(message);
    }
  };

  const enrollInCourse = async (courseId: string) => {
    if (!courseId) {
      throw new Error('ID de formation invalide');
    }

    setError(null);
    try {
      const res = await apiService.enrollInCourse(courseId);
      // Optimistically update the course in state
      setCourses(prev => prev.map(c => 
        c.id === courseId ? { ...c, isEnrolled: true, progress: 0 } : c
      ));
      await fetchCourses();
      return res;
    } catch (error: unknown) {
      const errorMessage = (error as { message?: string })?.message ?? '';
      
      // Handle already enrolled case
      if (errorMessage.toLowerCase().includes('déjà') || errorMessage.toLowerCase().includes('already enrolled')) {
        console.warn('Enroll warning (already enrolled):', errorMessage);
        setCourses(prev => prev.map(c => 
          c.id === courseId ? { ...c, isEnrolled: true } : c
        ));
        try { 
          await fetchCourses(); 
        } catch (err) { 
          console.warn('Failed to refresh courses after already-enrolled handling', err); 
        }
        return { message: errorMessage };
      }

      const message = handleError(error, 'Erreur lors de l\'inscription à la formation');
      throw new Error(message);
    }
  };

  const markLessonComplete = async (courseId: string, lessonId: string) => {
    if (!courseId || !lessonId) {
      throw new Error('ID de formation ou de leçon invalide');
    }

    setError(null);
    try {
      await apiService.completeLesson(courseId, lessonId);
      const updatedCourse = await fetchCourseById(courseId);
      if (updatedCourse) {
        setCourses(prev =>
          prev.map(c => (c.id === courseId ? updatedCourse : c))
        );
      }
    } catch (error: any) {
      const message = handleError(error, 'Erreur lors de la complétion de la leçon');
      throw new Error(message);
    }
  };

  const value: CoursesContextType = {
    courses,
    addCourse,
    updateCourse,
    deleteCourse,
    enrollInCourse,
    markLessonComplete,
    fetchCourses,
    fetchCourseById,
    loading,
    error,
    clearError,
  };

  return <CoursesContext.Provider value={value}>{children}</CoursesContext.Provider>;
};

// Hook personnalisé pour les tests
export const useCoursesTest = (defaultValue?: CoursesContextType) => {
  const [context] = useState<CoursesContextType | undefined>(defaultValue);
  return context || useContext(CoursesContext);
};