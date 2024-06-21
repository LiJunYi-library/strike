import { defineComponent } from 'vue'

export default defineComponent({
  setup() {
    return () => {
      return (
        <div class="greetings">
          <h1 class="green">{123}</h1>
          <h3>
            You’ve successfully created a project with
            <a href="https://vitejs.dev/" target="_blank" rel="noopener">
              Vite
            </a>{' '}
            +
            <a href="https://vuejs.org/" target="_blank" rel="noopener">
              Vue 3
            </a>
            . What's next?
          </h3>
        </div>
      )
    }
  }
})
