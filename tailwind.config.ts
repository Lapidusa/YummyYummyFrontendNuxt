
/** @type {import('tailwindcss').Config} */
export default {
   content: [
   './components/**/*.{vue,js,ts}',
   './layouts/**/*.vue',
   './pages/**/*.vue',
   './app.vue',
   './plugins/**/*.{js,ts}',
 ],
 theme: {
   extend: {
       colors: {
         "orange": '#FE9200',
         "yellow": '#FFC746',
         "lightGray": '#FBFBFB',
         "gray": '#EFF0F3',
         "green": '#17B404',
         "red": '#F63204',
       },
       fontFamily: {
            nunito: ['Nunito', 'sans-serif']
       },
       width:{
         fill: "-webkit-fill-available"
       }
   },
 },
 plugins: [],
}

