
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
         "lightGray": '#FBFBFB',
         "Gray": '#EFF0F3',
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

