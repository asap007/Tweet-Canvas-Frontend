import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import axios from 'axios';

const TweetCanvas = () => {
  const [option, setOption] = useState('image');
  const [username, setUsername] = useState('');
  const [content, setContent] = useState('');
  const [template, setTemplate] = useState('light');
  const [imageUrl, setImageUrl] = useState('');
  const [improvedContent, setImprovedContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [loading, setLoading] = useState(false);

  const errorContainerRef = useRef(null);
  const contentTextareaRef = useRef(null);
  const usernameInputRef = useRef(null);
  const imageContainerRef = useRef(null);
  const improvedContentContainerRef = useRef(null);


  const showError = (message) => {
    const errorContainer = errorContainerRef.current;
    errorContainer.textContent = message;
    errorContainer.classList.remove('hidden');

    const isMobile = window.innerWidth < 768;

    gsap.fromTo(errorContainer, 
      { 
        opacity: 0, 
        y: isMobile ? -50 : -20,
        scale: isMobile ? 0.95 : 1
      },
      { 
        duration: 0.3, 
        opacity: 1, 
        y: 0,
        scale: 1,
        ease: "power3.out",
        onComplete: () => {
          setTimeout(() => {
            gsap.to(errorContainer, { 
              duration: 0.3, 
              opacity: 0, 
              y: isMobile ? -50 : -20,
              scale: isMobile ? 0.95 : 1,
              ease: "power3.in",
              onComplete: () => errorContainer.classList.add('hidden')
            });
          }, 5000);
        }
      }
    );
  };

  const handleOptionChange = (e) => {
    setOption(e.target.value);
    if (e.target.value === 'screenshot') {
      gsap.to("#screenshotOptions", {duration: 0.3, opacity: 1, height: "auto", display: "block"});
    } else {
      gsap.to("#screenshotOptions", {duration: 0.3, opacity: 0, height: 0, display: "none"});
    }
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    const count = e.target.value.length;
    const charCount = document.getElementById('charCount');
    charCount.textContent = `${count} / 280`;
    charCount.classList.toggle('text-red-500', count > 280);
    gsap.to(charCount, {duration: 0.3, scale: count > 280 ? 1.1 : 1, ease: "elastic.out(1, 0.3)"});
  };

  const handleTemplateChange = (selectedTemplate) => {
    setTemplate(selectedTemplate);
    document.querySelectorAll('.template-btn').forEach(btn => {
      btn.classList.remove('bg-twitter-blue', 'text-white');
      if (btn.dataset.template === selectedTemplate) {
        btn.classList.add('bg-twitter-blue', 'text-white');
        gsap.from(btn, {duration: 0.3, scale: 0.9, ease: "back.out(1.7)"});
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (content.trim() === '') {
      showError('Please enter some content for your tweet.');
      gsap.to(contentTextareaRef.current, {duration: 0.1, x: 10, yoyo: true, repeat: 5});
      return;
    }
    
    if (option === 'screenshot' && username.trim() === '') {
      gsap.to(usernameInputRef.current, {duration: 0.1, x: 10, yoyo: true, repeat: 5});
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post('https://tweet-canvas.onrender.com/generate', {
        option,
        text: content,
        template,
        username
      }, {
        responseType: 'blob'
      });
      
      const imageUrl = URL.createObjectURL(response.data);
      setImageUrl(imageUrl);
      gsap.to(imageContainerRef.current, {duration: 0.5, opacity: 1, height: "auto", display: "block"});
    } catch (error) {
      console.error('Error:', error);
      showError(error.response?.data?.error || 'Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  const handleImprove = async () => {
    if (content.trim() === '') {
      showError('Please enter some content to improve.');
      gsap.to(contentTextareaRef.current, {duration: 0.1, x: 10, yoyo: true, repeat: 5});
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post('https://tweet-canvas.onrender.com/improve', {
        text: content
      });
      
      setOriginalContent(content);
      setImprovedContent(response.data.improvedText);
      gsap.to(improvedContentContainerRef.current, {duration: 0.5, opacity: 1, height: "auto", display: "block"});
    } catch (error) {
      console.error('Error:', error);
      showError(error.response?.data?.error || 'Failed to improve content');
    } finally {
      setLoading(false);
    }
  };

  const handleReplace = () => {
    setContent(improvedContent);
    gsap.to(improvedContentContainerRef.current, {duration: 0.5, opacity: 0, height: 0, display: "none"});
  };

  const handleRevert = () => {
    setContent(originalContent);
    gsap.to(improvedContentContainerRef.current, {duration: 0.5, opacity: 0, height: 0, display: "none"});
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'tweetcanvas.png';
    link.click();
    gsap.to("#downloadBtn", {duration: 0.3, scale: 0.95, yoyo: true, repeat: 1});
  };

  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen flex items-center justify-center p-4 font-poppins">
      <div ref={errorContainerRef} className="fixed top-4 left-4 right-4 md:left-1/2 md:right-auto md:transform md:-translate-x-1/2 bg-red-500 text-white p-4 rounded-xl shadow-lg z-50 hidden max-w-md w-full mx-auto text-center"></div>
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-8 space-y-8">
        {/* Logo and Title */}
        <div className="flex items-center justify-center space-x-4 mb-4">
          <img src="/images/logo.png" alt="TweetCanvas Logo" className="w-12 h-12 object-contain rounded-xl float" />
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-twitter-blue to-blue-600 float">TweetCanvas</h1>
        </div>
        
        {/* Subtitle */}
        <div className="text-center">
          <p className="text-gray-600 text-sd md:text-md lg:text-lg">Transform your thoughts into captivating visuals</p>
        </div>
        
        {/* Form */}
        <div className="space-y-6">
          {/* Option Select */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Choose a template:</label>
            <select 
              value={option} 
              onChange={handleOptionChange}
              className="w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 twitter-blue focus:border-transparent transition-all duration-300"
            >
              <option value="screenshot">Tweet Screenshot</option>
              <option value="image">Tweet through Image</option>
            </select>
          </div>
          
          {/* Form inputs */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {option === 'screenshot' && (
              <div id="screenshotOptions" className="space-y-4">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  ref={usernameInputRef}
                  className="w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-twitter-blue focus:border-transparent transition-all duration-300"
                  placeholder="Twitter Username"
                />
              </div>
            )}
            
            <div className="relative">
              <textarea
                value={content}
                onChange={handleContentChange}
                ref={contentTextareaRef}
                rows="4"
                className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-twitter-blue focus:border-transparent resize-none transition-all duration-300"
                placeholder="What's on your mind? Type your unlimited tweet here..."
              ></textarea>
              <div className="absolute bottom-3 right-3 text-xs text-gray-400" id="charCount">0 / 280</div>
            </div>

            {/* Improve button */}
            <button
              type="button"
              onClick={handleImprove}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-6 rounded-xl transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {loading ? <span className="loading"></span> : 'Improve with AI'}
            </button>

            {/* Improved content container */}
            <div ref={improvedContentContainerRef} className="hidden space-y-4">
              <textarea
                value={improvedContent}
                readOnly
                rows="4"
                className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-twitter-blue focus:border-transparent resize-none transition-all duration-300"
              ></textarea>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleReplace}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Replace Content
                </button>
                <button
                  type="button"
                  onClick={handleRevert}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-xl transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Revert to Original
                </button>
              </div>
            </div>
            
            {/* Template selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Choose a theme:</label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => handleTemplateChange('light')}
                  className="flex-1 py-2 px-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-twitter-blue template-btn bg-twitter-blue text-white"
                  data-template="light"
                >
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => handleTemplateChange('dark')}
                  className="flex-1 py-2 px-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-twitter-blue template-btn"
                  data-template="dark"
                >
                  Dark
                </button>
        
                </div>
            </div>
            
            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-twitter-blue to-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-twitter-blue"
            >
              {loading ? <span className="loading"></span> : 'Generate Canvas'}
            </button>
          </form>
          
          {/* Image result */}
          <div ref={imageContainerRef} className="hidden space-y-4">
            <img src={imageUrl} alt="Generated Tweet" className="w-full rounded-xl shadow-lg" />
            <button
              onClick={handleDownload}
              id="downloadBtn"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Download Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TweetCanvas;
