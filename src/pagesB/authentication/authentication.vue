<template>
	<page>
		<view slot="body">
			<!-- 客户信息 -->
			<view class="list">
				<view class="title"><text class="sign">*</text>账户：</view>
				<view class="action">
					<input type="number" v-model="form.userName" placeholder="请输入手机号" />
				</view>
			</view>
			<view class="list">
				<view class="title">别名：</view>
				<view class="action">
					<input type="number" v-model="form.userAlias" placeholder="请输入别名" />
				</view>
			</view>
			<view class="list">
				<view class="title">角色：</view>
				<view class="action">
					<input type="number" v-model="form.userRole" placeholder="请输入角色" />
				</view>
			</view>
			<view class="list" hover-class="hover">
				<view class="title"><text class="sign">*</text>时间：</view>
				<view class="action">
					<datetime-picker class="datePicker" :dateStr="form.userTime" :defaultValue="form.time" fields="day" @change="changeContractDate">
					</datetime-picker>
					<text class="icon iconfont icon-arrow-right"></text>
				</view>
			</view>
		</view>
		<view slot="footer">
			<view class="btns">
				<button class="btn bg-red" @tap="submitForm">提交</button>
			</view>
		</view>
	</page>
</template>

<script>
	import md5 from "@/common/js/md5.js"
	export default {
		data() {
			return {
				form: {
					userName: '',
					userAlias: '',
					userRole: '',
					userTime: ''
				}
			};
		},
		onLoad() {
			this.form.userTime = this.$utils.getCurrentDate()
		},
		methods: {
			// 时间
			changeContractDate(e) {
				this.form.userTime = e.f1;
			},
			submitForm() {
				if (this.form.userName == '') {
					this.$msg('账户不能为空')
					return
				}
				let time = Number(new Date(this.form.userTime))
				function objKeySort(arys) {
					var newkey = Object.keys(arys).sort();
					var newObj = ''; 
					for (var i = 0; i < newkey.length; i++) {
						newObj += [newkey[i]] + '=' + arys[newkey[i]] + '&';
					}
					return newObj.substring(0, newObj.length - 1);
				}
				var data = {
					userName: this.form.userName,
					userTime: time
				}
				if (this.form.userAlias !== '') {
					data.userAlias = this.form.userAlias
				}
				if (this.form.userRole !== '') {
					data.userRole = this.form.userRole
				}
				data = objKeySort(data)
				data= md5.hex_md5(data + "&key" + '6kDYeOERDE6OSQQMYF4XKA')
				uni.request({
					url: 'https://data.kukahome.com/Auth', //仅为示例，并非真实接口地址。
					method:'POST',
					data: {
						userName: this.form.userName,
						userAlias: this.form.userAlias,
						userRole: this.form.userRole,
						userSign: data,
						userTime: time
					},
					header: {
						"Content-Type": "application/x-www-form-urlencoded",
					},
					success: (res) => {
						console.log(res);

					}
				});

			},

		}
	}
</script>

<style lang="scss">
	.action {
		display: flex;
		justify-content: space-between;
		align-items: center;

		.datePicker,
		input {
			flex: 1;
		}
	}
</style>
