<script>
import { h, ref } from 'vue'

export default {
  props: {
    msg: String
  },
  setup(props) {
    const count = ref(1)
    return () =>
      h(
        'div',
        {
          onClick: (event) => {
            count.value++
          }
        },
        props.msg + count.value
      )
  }
}

</script>
