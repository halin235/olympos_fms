/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 올림포스 브랜드 컬러 시스템
        olympos: {
          blue:       '#1B4FBF',
          'blue-mid': '#2563EB',
          'blue-lt':  '#EEF3FD',
          navy:       '#0F2B6B',
          gray:       '#6B7280',
          'gray-lt':  '#F3F4F6',
          'gray-bd':  '#E5E7EB',
          warning:    '#F59E0B',
          danger:     '#EF4444',
          success:    '#10B981',
        },
      },
      fontFamily: {
        sans: ['"Pretendard"', '"Noto Sans KR"', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
      },
    },
  },
  plugins: [],
};
