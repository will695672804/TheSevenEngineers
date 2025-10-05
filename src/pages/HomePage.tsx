import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Users, BookOpen, ShoppingBag, Play, Award, MessageCircle } from 'lucide-react';
import { useCourses } from '../contexts/CoursesContext';
import { useProducts } from '../contexts/ProductsContext';

const HomePage: React.FC = () => {
  const { courses } = useCourses();
  const { products } = useProducts();

  const featuredCourses = courses.slice(0, 3);
  const featuredProducts = products.slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="mb-6">
                <span className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-full text-sm font-semibold">
                  🎓 Centre de Formation Professionnel
                </span>
              </div>
              <h1 className="text-6xl font-bold leading-tight">
                Votre expertise technique commence 
                <span className="text-yellow-300"> avec nous</span>
              </h1>
              <p className="text-xl text-blue-100 leading-relaxed">
                <strong>THE SEVEN ENGINEER</strong> est un centre de formation à but non lucratif situé à Ngaoundéré. 
                Nous offrons un soutien aux étudiants, élèves, entreprises et startups avec des formations pratiques 
                en sciences de l'ingénieur, des services d\'ingénierie et du matériel technique de qualité.
              </p>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 border border-white border-opacity-20">
                <h3 className="text-lg font-semibold mb-3">Pourquoi nous choisir ?</h3>
                <ul className="space-y-2 text-blue-100">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-300 rounded-full mr-3"></div>
                    Formations pratiques en sciences de l'ingénieur
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-300 rounded-full mr-3"></div>
                    Bureau d'étude et services d\'ingénierie
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-300 rounded-full mr-3"></div>
                    Laboratoire d'analyse chimique et microbiologique
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-300 rounded-full mr-3"></div>
                    Matériel électronique et équipements industriels
                  </li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/courses"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Explorer les formations
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/shop"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Matériel & Équipements
                  <ShoppingBag className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?w=600"
                alt="Formation en ligne"
                className="rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute -bottom-6 -left-6 bg-white text-gray-900 p-6 rounded-xl shadow-2xl border-4 border-yellow-300">
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Award className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">10 Pôles</p>
                    <p className="text-sm text-gray-600 font-medium">de Formation</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-yellow-400 text-gray-900 p-4 rounded-full shadow-lg">
                <div className="text-center">
                  <p className="font-bold text-lg">4.9★</p>
                  <p className="text-xs font-semibold">Note moyenne</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Presentation Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              À propos de <span className="text-blue-600">THE SEVEN ENGINEER</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              THE SEVEN ENGINEER est un centre de formation à but non lucratif situé dans l'arrondissement de Ngaoundéré 3ème, 
              précisément à Bini. Notre mission est d'apporter un soutien complémentaire à la formation de la jeunesse camerounaise 
              et d'ouvrir une porte entre l'école et l'industrie en orientant nos formations sur les métiers d'ingénierie.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-gray-900">Notre Vision</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Dans un environnement où la jeunesse est de plus en plus en proie au manque de compétence pratique, 
                nous offrons la possibilité d'être des porteurs de solutions et acteurs du développement de leur pays. 
                Notre objectif est de promouvoir l'import substitution et le transfert de technologie.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Formations Pratiques</h4>
                    <p className="text-gray-600">Orientées vers les sciences appliquées et l'ingénierie</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <ShoppingBag className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Bureau d'Étude</h4>
                    <p className="text-gray-600">Services d'ingénierie et conception d'équipements</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <MessageCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Laboratoire d'Analyse</h4>
                    <p className="text-gray-600">Analyses chimiques, microbiologiques et biologiques</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?w=600"
                alt="Équipe EduCommerce"
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-12">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Nos Valeurs</h3>
              <p className="text-gray-600 text-lg">Les principes qui guident notre action au quotidien</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Excellence</h4>
                <p className="text-gray-600">
                  Nous offrons des formations de qualité avec des formateurs qualifiés 
                  et des équipements modernes pour garantir l'acquisition de compétences.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Communauté</h4>
                <p className="text-gray-600">
                  Nous ciblons les étudiants, élèves, entreprises, startups et particuliers 
                  pour créer une communauté d'apprentissage technique et pratique.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Innovation</h4>
                <p className="text-gray-600">
                  Nous portons des projets innovateurs dans le développement durable 
                  et intégrons les dernières technologies industrielles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">THE SEVEN ENGINEER en chiffres</h2>
            <p className="text-gray-600">Des résultats qui parlent d'eux-mêmes</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: BookOpen, number: '10', label: 'Pôles de Formation' },
              { icon: Users, number: '24', label: 'Places Disponibles' },
              { icon: Star, number: '4.8', label: 'Note moyenne' },
              { icon: Award, number: '4', label: 'Services Principaux' }
            ].map((stat, index) => (
              <div key={index} className="text-center bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos Pôles de Formation</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Découvrez nos 10 pôles de formation spécialisés dans les sciences de l'ingénieur
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map(course => (
              <div key={course.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-2 py-1 rounded-lg text-sm font-medium">
                    {course.level}
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center">
                    <div className="opacity-0 hover:opacity-100 transition-opacity">
                      <Play className="h-12 w-12 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">Par {course.instructor}</span>
                    <span className="text-sm text-gray-500">{course.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium ml-1">{course.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500">({course.studentsCount})</span>
                    </div>
                    <span className="text-xl font-bold text-blue-600">{course.price}€</span>
                  </div>
                  <Link
                    to={`/course/${course.id}`}
                    className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center block"
                  >
                    Voir le cours
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/courses"
              className="inline-flex items-center bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voir toutes les formations
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Matériel et Équipements</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Composants électroniques, matériel de laboratoire et équipements industriels
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative group">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.stock <= 10 && (
                    <div className="absolute top-4 left-4 bg-orange-500 text-white px-2 py-1 rounded-lg text-sm font-medium">
                      Stock limité
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium ml-1">{product.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500">({product.reviewsCount})</span>
                    </div>
                    <span className="text-sm text-gray-500">{product.stock} en stock</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-600">{product.price}€</span>
                    <Link
                      to={`/product/${product.id}`}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Voir le produit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/shop"
              className="inline-flex items-center bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Voir tous les produits
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à développer vos compétences techniques ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Rejoignez THE SEVEN ENGINEER pour des formations pratiques et des services d'ingénierie de qualité
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/courses"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Voir nos formations
            </Link>
            <Link
              to="/login"
              className="border border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;