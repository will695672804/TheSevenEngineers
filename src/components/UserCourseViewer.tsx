import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, CheckCircle, Clock, BookOpen } from 'lucide-react';
import { Course } from '../contexts/CoursesContext';
import { useCourses } from '../contexts/CoursesContext';

interface UserCourseViewerProps {
  course: Course;
  onBack: () => void;
}

const UserCourseViewer: React.FC<UserCourseViewerProps> = ({ course, onBack }) => {
  const { markLessonComplete } = useCourses();
  const [currentLessonIndex, setCurrentLessonIndex] = useState(() => {
    // Find the first incomplete lesson or default to 0
    const firstIncompleteIndex = course.lessons.findIndex(lesson => !lesson.isCompleted);
    return firstIncompleteIndex !== -1 ? firstIncompleteIndex : 0;
  });

  useEffect(() => {
    // Update currentLessonIndex if the course or its lessons change
    const firstIncompleteIndex = course.lessons.findIndex(lesson => !lesson.isCompleted);
    setCurrentLessonIndex(firstIncompleteIndex !== -1 ? firstIncompleteIndex : 0);
  }, [course]);

  const currentLesson = course.lessons[currentLessonIndex];
  const completedLessons = course.lessons.filter(lesson => lesson.isCompleted).length;
  const progressPercentage = Math.round((completedLessons / course.lessons.length) * 100);

  const handleLessonComplete = () => {
    if (currentLesson && !currentLesson.isCompleted) {
      markLessonComplete(course.id, currentLesson.id);
    }
  };

  const handleNextLesson = () => {
    if (currentLessonIndex < course.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  const handlePreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Retour à mes formations
        </button>
        <div className="text-sm text-gray-500">
          Progression: {progressPercentage}% ({completedLessons}/{course.lessons.length} leçons)
        </div>
      </div>

      {/* Course Info */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-start space-x-4">
          <img
            src={course.image}
            alt={course.title}
            className="w-20 h-20 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h1>
            <p className="text-gray-600 mb-2">Par {course.instructor}</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="aspect-video bg-gray-900 relative">
              {currentLesson?.videoUrl && currentLesson.videoUrl !== '#' ? (
                <video
                  key={currentLesson.id}
                  className="w-full h-full"
                  controls
                  poster={course.image}
                >
                  <source src={currentLesson.videoUrl} type="video/mp4" />
                  Votre navigateur ne supporte pas la lecture vidéo.
                </video>
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  <div className="text-center">
                    <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Vidéo de démonstration</p>
                    <p className="text-sm opacity-75">La vidéo sera disponible prochainement</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{currentLesson?.title}</h2>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{currentLesson?.duration}</span>
                    <span className="mx-2">•</span>
                    <span>Leçon {currentLessonIndex + 1} sur {course.lessons.length}</span>
                  </div>
                </div>
                {currentLesson && !currentLesson.isCompleted && (
                  <button
                    onClick={handleLessonComplete}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marquer comme terminé
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={handlePreviousLesson}
                  disabled={currentLessonIndex === 0}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Leçon précédente
                </button>
                <button
                  onClick={handleNextLesson}
                  disabled={currentLessonIndex === course.lessons.length - 1}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Leçon suivante
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lessons List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Programme du cours
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {course.lessons.map((lesson, index) => (
                <button
                  key={lesson.id}
                  onClick={() => setCurrentLessonIndex(index)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    index === currentLessonIndex
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {lesson.isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : index === currentLessonIndex ? (
                        <Play className="h-5 w-5 text-blue-600" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-500">{index + 1}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium text-sm ${
                        index === currentLessonIndex ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {lesson.title}
                      </h4>
                      <p className="text-xs text-gray-500">{lesson.duration}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCourseViewer;