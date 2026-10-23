import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { CodeBlock } from "../code-block";

const useCases = [
  {
    key: "React",
    logo: "/icons/react.png",
    language: "js",
    code: `import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default function App() {
  const [todos, setTodos] = useState([])

  useEffect(() => {
    supabase.from('todos').select('*')
      .then(({ data }) => setTodos(data))
  }, [])

  return <TodoList items={todos} />
}`,
  },
  {
    key: "Next",
    logo: "/icons/next.png",
    language: "js",

    code: `import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function Page() {
  const { data: todos } = await supabase
    .from('todos')
    .select('*')

  return <TodoList items={todos} />
}`,
  },
  {
    key: "Svelte",
    logo: "/icons/svelte.png",
    language: "js",

    code: `<script>
  import { createClient } from '@supabase/supabase-js'

  const supabase = createClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY
  )

  let todos = []

  async function loadTodos() {
    const { data } = await supabase
      .from('todos').select('*')
    todos = data
  }
</script>`,
  },
  {
    key: "Vanilla",
    logo: "/icons/js.png",
    language: "js",

    code: `import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default function App() {
  const [todos, setTodos] = useState([])

  useEffect(() => {
    supabase.from('todos').select('*')
      .then(({ data }) => setTodos(data))
  }, [])

  return <TodoList items={todos} />
}`,
  },
  {
    key: "Vue",
    logo: "/icons/vue.png",
    language: "js",

    code: `<script setup>
import { createClient } from '@supabase/supabase-js'
import { ref, onMounted } from 'vue'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const todos = ref([])

onMounted(async () => {
  const { data } = await supabase
    .from('todos').select('*')
  todos.value = data
})
</script>`,
  },
  {
    key: "Nuxt",
    logo: "/icons/nuxt.png",
    language: "js",

    code: `<script setup>
const supabase = useSupabaseClient()

const { data: todos } = await useAsyncData(
  'todos',
  async () => {
    const { data } = await supabase
      .from('todos')
      .select('*')
    return data
  }
)
</script>

<template>
  <TodoList :items="todos" />
</template>`,
  },
];

export function UseCaseSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 gap-10 rounded-xl p-8 md:grid-cols-2 md:p-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Use Omnibase with <br />
              <span className="text-muted-foreground">your framework</span>
            </h2>
          </div>

          <div className="flex flex-col items-center gap-8">
            <Tabs defaultValue="React" className="w-full">
              <TabsList className="grid w-full grid-cols-6 min-h-16">
                {useCases.map((item) => (
                  <TabsTrigger
                    value={item.key}
                    key={item.key}
                    className="group cursor-pointer p-4"
                  >
                    <img
                      src={item.logo}
                      alt={`${item.key} logo`}
                      className="h-6 w-6 object-contain grayscale opacity-60 transition-all duration-200
      group-hover:opacity-100 group-hover:brightness-50
      group-focus-visible:opacity-100 group-focus-visible:brightness-50
      group-data-[state=active]:opacity-100 group-data-[state=active]:brightness-50"
                    />
                  </TabsTrigger>
                ))}
              </TabsList>
              {Object.values(useCases).map(({ key, code, language }) => (
                <TabsContent key={key} value={key} className="mt-4">
                  <CodeBlock code={code} language={language} />
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
    </section>
  );
}
