import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Clock,
  MessageCircle
} from 'lucide-react';

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      reset();
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: 'Email',
      content: 'info@biowastemarket.com',
      description: 'Send us an email anytime'
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: 'Phone',
      content: '+1 (555) 123-4567',
      description: 'Mon-Fri from 8am to 5pm EST'
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: 'Office',
      content: '123 Green Street, Eco City, EC 12345',
      description: 'Visit our office during business hours'
    }
  ];

  const faqs = [
    {
      question: 'How do I start listing waste on the platform?',
      answer: 'Simply create an account, click "List Waste" and fill in the details about your waste product. Our team will review and approve your listing within 24 hours.'
    },
    {
      question: 'Is there a fee to use BioWaste Market?',
      answer: 'Basic listing is free. We charge a small commission only on successful transactions. Premium features are available for business accounts.'
    },
    {
      question: 'How do payments work?',
      answer: 'We support secure payments through Stripe, bank transfers, and cash on delivery. Payments are held in escrow until successful delivery is confirmed.'
    },
    {
      question: 'Can I trust the sellers on the platform?',
      answer: 'All sellers undergo verification, and we have a rating system. We also offer dispute resolution to ensure safe transactions.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions about BioWaste Market? We're here to help. 
            Reach out to our team and we'll get back to you as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Send us a Message</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      {...register('firstName', {
                        required: 'First name is required',
                      })}
                      type="text"
                      className="input"
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      {...register('lastName', {
                        required: 'Last name is required',
                      })}
                      type="text"
                      className="input"
                      placeholder="Doe"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      type="email"
                      className="input pl-10"
                      placeholder="john@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    {...register('subject', {
                      required: 'Subject is required',
                    })}
                    className="input"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing Question</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    {...register('message', {
                      required: 'Message is required',
                      minLength: {
                        value: 10,
                        message: 'Message must be at least 10 characters',
                      },
                    })}
                    rows={5}
                    className="input"
                    placeholder="Tell us how we can help you..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    defaultChecked
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    I'd like to receive email updates about BioWaste Market
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary py-3 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Get in Touch</h3>
              
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start">
                    <div className="bg-primary-100 rounded-lg p-3 mr-4">
                      <div className="text-primary-600">{info.icon}</div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{info.title}</h4>
                      <p className="text-gray-900">{info.content}</p>
                      <p className="text-sm text-gray-600">{info.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Clock className="h-6 w-6 text-primary-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Business Hours</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monday - Friday</span>
                  <span className="text-gray-900">8:00 AM - 5:00 PM EST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saturday</span>
                  <span className="text-gray-900">9:00 AM - 1:00 PM EST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sunday</span>
                  <span className="text-gray-900">Closed</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <MessageCircle className="h-6 w-6 text-primary-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Live Chat</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Need immediate assistance? Start a live chat with our support team.
              </p>
              <button className="w-full btn-outline">
                Start Live Chat
              </button>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">
              Quick answers to common questions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
