package com.yam.funteer.donation.request;

import lombok.Getter;
import lombok.Setter;

@Getter@Setter
public class DonationJoinReq {
	private Long userId;
	private Long paymentAmount;

}
