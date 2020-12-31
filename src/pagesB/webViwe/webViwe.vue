<template>
	<view class="page-body">
		<view class="page-section page-section-gap">
			<web-view :src="url" v-if="status"></web-view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				url: '',
				status: false
			}
		},
		onLoad(options) {
			this.url=decodeURIComponent(options.url);
			this.status=true
		},
		onShow() {
			
		},
		methods: {
		
		}
	}
</script>

<style>

</style>
