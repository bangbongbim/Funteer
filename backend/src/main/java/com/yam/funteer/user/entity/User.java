package com.yam.funteer.user.entity;

import java.time.LocalDateTime;
import java.util.Optional;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import javax.validation.constraints.Email;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.sun.istack.NotNull;
import com.yam.funteer.attach.entity.Attach;
import com.yam.funteer.common.code.UserType;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "user")
@Getter @SuperBuilder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Inheritance(strategy = InheritanceType.JOINED)
public class User {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Email
	@Column(unique = true)
	private @NotNull String email;
	private String password;
	private @NotNull String name;

	@Column(unique = true)
	private String phone;
	@OneToOne
	@JoinColumn(name = "profile_id")
	private Attach profileImg;
	private LocalDateTime regDate;
	private Long money;
	@Enumerated(value = EnumType.STRING)
	@Column(nullable = false)
	private UserType userType;
	private Long totalPayAmount;

	public Optional<Attach> getProfileImg(){
		return Optional.ofNullable(this.profileImg);
	}
	public void updateProfile(Attach profileImg){
		this.profileImg = profileImg;
	}
	public void charge(Long amount) {
		this.money += amount;
	}
	public void changePassword(String password){
		this.password = password;
	}
	protected void signOut(UserType userType){
		this.userType = userType;
	}
	public void validate(){
		switch(userType){
			case NORMAL_RESIGN:
			case TEAM_RESIGN: throw new AccessDeniedException("????????? ???????????????.");
			case KAKAO: throw new AccessDeniedException("????????? ????????? ???????????? ?????????????????????");
			// case TEAM_WAIT: throw new AccessDeniedException("?????? ???????????? ???????????????.");
		}
	}
	public void validatePassword(PasswordEncoder passwordEncoder, String password){
		if(!passwordEncoder.matches(password, this.password))
			throw new IllegalArgumentException();
	}

	public void updateMoney(long amount) {
		this.money += amount;
	}

	protected void teamAccept() {
		this.userType = UserType.TEAM;
	}

	protected void expire() {
		this.userType = UserType.TEAM_EXPIRED;
	}

	public void checkMoney(Long amount) {
		if(amount <= 0) throw new IllegalArgumentException("????????? 0??? ??????????????? ?????????");
		if(this.money < amount) throw new IllegalArgumentException("????????? ???????????????.");
	}
}
