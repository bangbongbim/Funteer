package com.yam.funteer.pay.Entity;

import java.time.LocalDateTime;

import javax.naming.Name;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.yam.funteer.post.entity.Post;
import com.yam.funteer.user.entity.Member;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "payment")
@Getter
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Payment {

	@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@ManyToOne
	@JoinColumn(name = "post_id")
	private Post post;
	@ManyToOne
	@JoinColumn(name = "member_id")
	private Member member;
	private Long amount;
	private LocalDateTime payDate;
}
