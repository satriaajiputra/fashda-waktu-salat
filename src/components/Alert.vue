<template>
  <div class="alert" :class="types[alertType]">
    <div v-if="withIcon" class="alert__icon"
      >
      <img src="@/assets/icon-info.svg" alt="Icon Info">
    </div>
    <slot/>
  </div>
</template>

<script>
export default {
  props: {
    withIcon: {
      default: true,
      required: false,
      type: Boolean
    },
    alertType: {
      default: 'standard',
      required: false,
      type: String
    }
  },
  data () {
    return {
      types: {
        success: 'alert_success',
        warning: 'alert_warning',
        danger: 'alert_danger',
        info: 'alert_info'
      }
    }
  },
  methods: {
    type (alertType) {
      return this.type === alertType
    }
  }
}
</script>

<style lang="scss" scoped>
  /* Alert */
  .alert {
    @apply flex items-center border border-standard rounded-xl p-2;
    box-shadow: 0px 4px 7px rgba(0, 0, 0, 0.08);
  }
  .alert__icon {
    @apply bg-standard mr-3 w-10 h-10 flex justify-center items-center rounded-xl;
  }
  .alert_success {
    @apply border-primary;
    .alert__icon {
      @apply bg-primary;
    }
  }
  .alert_standard {
    @apply border-standard;
    .alert__icon {
      @apply bg-standard;
    }
  }
  .alert_danger {
    @apply border-red-600;
    .alert__icon {
      @apply bg-red-600;
    }
  }
  .alert_warning {
    @apply border-orange-600;
    .alert__icon {
      @apply bg-orange-600;
    }
  }
  .alert_info {
    @apply border-blue-600;
    .alert__icon {
      @apply bg-blue-600;
    }
  }
</style>
